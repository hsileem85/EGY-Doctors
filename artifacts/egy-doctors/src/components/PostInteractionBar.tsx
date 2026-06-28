import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Heart, MessageCircle, Share2, Send, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import {
  likePost, commentOnPost, sharePost, getPostComments,
  type ApiPostComment,
} from "@/lib/api";

export interface PostInteractionBarProps {
  postId: number;
  initialLikesCount: number;
  initialCommentsCount: number;
  initialSharesCount: number;
  isLikedByCurrentUser: boolean;
  doctorName?: string;
  postTitle?: string;
  doctorId?: string | number;
  isRTL?: boolean;
  variant?: "dark" | "light";
}

function formatTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return "Just now";
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return d === 1 ? "1d ago" : `${d}d ago`;
}

function initials(name: string) {
  return name.split(" ").filter(w => w[0]).slice(0, 2).map(w => w[0].toUpperCase()).join("") || "U";
}

export function PostInteractionBar({
  postId,
  initialLikesCount,
  initialCommentsCount,
  initialSharesCount,
  isLikedByCurrentUser: initialIsLiked,
  doctorName = "",
  postTitle = "",
  doctorId,
  isRTL = false,
  variant = "dark",
}: PostInteractionBarProps) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  const [likesCount, setLikesCount] = useState(initialLikesCount);
  const [commentsCount, setCommentsCount] = useState(initialCommentsCount);
  const [sharesCount, setSharesCount] = useState(initialSharesCount);
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [isExpanded, setIsExpanded] = useState(false);
  const [commentInput, setCommentInput] = useState("");
  const [isShared, setIsShared] = useState(false);

  useEffect(() => { setLikesCount(initialLikesCount); }, [initialLikesCount]);
  useEffect(() => { setCommentsCount(initialCommentsCount); }, [initialCommentsCount]);
  useEffect(() => { setSharesCount(initialSharesCount); }, [initialSharesCount]);
  useEffect(() => { setIsLiked(initialIsLiked); }, [initialIsLiked]);

  const { data: comments = [], isLoading: commentsLoading } = useQuery<ApiPostComment[]>({
    queryKey: ["postComments", postId],
    queryFn: () => getPostComments(postId),
    enabled: isExpanded,
    staleTime: 60_000,
  });

  const likeMutation = useMutation({
    mutationFn: () => likePost(postId),
    onMutate: () => {
      const wasLiked = isLiked;
      setIsLiked(!wasLiked);
      setLikesCount(prev => prev + (wasLiked ? -1 : 1));
      return { wasLiked };
    },
    onSuccess: (data) => {
      setLikesCount(data.likesCount);
      setIsLiked(data.liked);
    },
    onError: (_err, _vars, ctx) => {
      if (ctx) {
        setIsLiked(ctx.wasLiked);
        setLikesCount(prev => prev + (ctx.wasLiked ? 1 : -1));
      }
      toast({ title: isRTL ? "فشل تسجيل الإعجاب" : "Failed to update like", variant: "destructive" });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["magazinePosts"] });
      queryClient.invalidateQueries({ queryKey: ["doctorPosts"] });
    },
  });

  const commentMutation = useMutation({
    mutationFn: (text: string) => commentOnPost(postId, text),
    onSuccess: () => {
      setCommentInput("");
      setCommentsCount(prev => prev + 1);
      queryClient.invalidateQueries({ queryKey: ["postComments", postId] });
    },
    onError: () => {
      toast({ title: isRTL ? "فشل إضافة التعليق" : "Failed to add comment", variant: "destructive" });
    },
  });

  const shareMutation = useMutation({
    mutationFn: () => sharePost(postId),
    onSuccess: (data) => { setSharesCount(data.sharesCount); },
  });

  const handleLike = () => {
    if (!user) {
      toast({ title: isRTL ? "يرجى تسجيل الدخول أولاً" : "Please sign in to like posts" });
      return;
    }
    likeMutation.mutate();
  };

  const handleShare = async () => {
    setIsShared(true);
    setTimeout(() => setIsShared(false), 2000);

    const base = window.location.origin + (import.meta.env.BASE_URL ?? "/").replace(/\/$/, "");
    const url = `${base}/magazine?postId=${postId}`;
    const shareData = {
      title: postTitle || (isRTL ? `منشور من ${doctorName}` : `Post by ${doctorName}`),
      text: isRTL
        ? `تحقق من هذه النصيحة الطبية من الدكتور ${doctorName} على إيجي دكتورز`
        : `Check out this medical advice from Dr. ${doctorName} on EGY Doctors.`,
      url,
    };

    shareMutation.mutate();

    if (navigator.share) {
      try { await navigator.share(shareData); } catch { /* dismissed */ }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        toast({ title: isRTL ? "تم نسخ الرابط!" : "Link copied to clipboard!" });
      } catch {
        toast({ title: isRTL ? "تعذر نسخ الرابط" : "Could not copy link", variant: "destructive" });
      }
    }
  };

  const handleComment = () => {
    if (!user) {
      toast({ title: isRTL ? "يرجى تسجيل الدخول أولاً" : "Please sign in to comment" });
      return;
    }
    const text = commentInput.trim();
    if (!text) return;
    commentMutation.mutate(text);
  };

  const isDark = variant === "dark";

  const borderColor = isDark ? "border-[#334155]" : "border-gray-100";
  const iconInactive = isDark ? "text-gray-400 hover:text-[#D4A853]" : "text-gray-500 hover:text-[#D4A853]";
  const iconActive = "text-[#D4A853]";
  const sectionBg = isDark ? "bg-[#0F172A]/30" : "bg-gray-50";
  const commentBubbleBg = isDark ? "bg-[#1E293B]" : "bg-gray-100";
  const commentBubbleText = isDark ? "text-white" : "text-gray-900";
  const commentBodyText = isDark ? "text-gray-300" : "text-gray-600";
  const commentTimeText = isDark ? "text-gray-500" : "text-gray-400";
  const emptyText = isDark ? "text-gray-500" : "text-gray-400";
  const inputBg = isDark
    ? "bg-[#0F172A] border-[#334155] text-white placeholder:text-gray-500 focus-visible:ring-[#D4A853]"
    : "bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus-visible:ring-[#D4A853]";
  const avatarBg = isDark ? "bg-[#1E293B]" : "bg-gray-200";
  const avatarUserBg = isDark ? "bg-[#D4A853]/10" : "bg-[#D4A853]/10";

  return (
    <div>
      {/* Action Bar */}
      <div className={`flex items-center gap-4 py-3 border-t ${borderColor}`}>
        <button
          onClick={handleLike}
          disabled={likeMutation.isPending}
          className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${isLiked ? iconActive : iconInactive}`}
        >
          <Heart className={`h-5 w-5 ${isLiked ? "fill-[#D4A853]" : ""}`} />
          <span>{likesCount}</span>
        </button>

        <button
          onClick={() => setIsExpanded(e => !e)}
          className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${isExpanded ? iconActive : iconInactive}`}
        >
          <MessageCircle className="h-5 w-5" />
          <span>{commentsCount}</span>
        </button>

        <button
          onClick={handleShare}
          className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${isShared ? iconActive : iconInactive}`}
        >
          <Share2 className="h-5 w-5" />
          <span>{isShared ? (isRTL ? "مشاركة!" : "Shared!") : sharesCount}</span>
        </button>
      </div>

      {/* Comments Section */}
      {isExpanded && (
        <div className={`pt-3 pb-2 rounded-lg px-3 ${sectionBg}`}>
          {commentsLoading ? (
            <div className="flex justify-center py-3">
              <Loader2 className="h-4 w-4 animate-spin text-[#D4A853]" />
            </div>
          ) : (
            <div className="space-y-3 mb-3">
              {comments.length === 0 ? (
                <p className={`text-xs text-center py-3 ${emptyText}`}>
                  {isRTL ? "لا توجد تعليقات بعد. كن أول معلق!" : "No comments yet. Be the first!"}
                </p>
              ) : (
                comments.map(comment => (
                  <div key={comment.id} className="flex items-start gap-2">
                    <Avatar className="w-7 h-7 shrink-0">
                      <AvatarFallback className={`text-[#D4A853] text-xs font-bold ${avatarBg}`}>
                        {initials(comment.userName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`flex-1 rounded-lg px-3 py-2 ${commentBubbleBg}`}>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`font-semibold text-xs ${commentBubbleText}`}>{comment.userName}</span>
                        <span className={`text-xs ${commentTimeText}`}>{formatTime(comment.createdAt)}</span>
                      </div>
                      <p className={`text-xs leading-relaxed ${commentBodyText}`}>{comment.text}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Comment Input */}
          <div className="flex items-center gap-2">
            <Avatar className="w-7 h-7 shrink-0">
              <AvatarFallback className={`text-[#D4A853] text-xs font-bold ${avatarUserBg}`}>
                {user ? initials(user.name) : "?"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 flex items-center gap-2">
              <Input
                value={commentInput}
                onChange={e => setCommentInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") handleComment(); }}
                placeholder={
                  user
                    ? (isRTL ? "أكتب تعليقاً..." : "Write a comment...")
                    : (isRTL ? "سجّل الدخول للتعليق" : "Sign in to comment")
                }
                disabled={!user || commentMutation.isPending}
                className={`h-8 text-xs focus-visible:ring-1 ${inputBg}`}
              />
              <Button
                size="icon"
                onClick={handleComment}
                disabled={!user || commentMutation.isPending || !commentInput.trim()}
                className="h-8 w-8 bg-[#D4A853] text-[#0F172A] hover:bg-[#C49A48] shrink-0"
              >
                {commentMutation.isPending
                  ? <Loader2 className="h-3 w-3 animate-spin" />
                  : <Send className="h-3 w-3" />}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
