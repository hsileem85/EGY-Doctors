import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import {
  getMagazinePosts, getPostComments, likePost, commentOnPost, sharePost,
  type ApiMagazinePost, type ApiPostComment,
} from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { getEmbedUrl } from "@/lib/youtube";
import {
  Heart, MessageCircle, Share2, Bookmark, BookmarkCheck,
  PlayCircle, FileText, MoreHorizontal, Send,
  Filter, TrendingUp, Clock, UserPlus, UserCheck, Newspaper, Loader2,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

type PostType = "article" | "video" | "tip";

interface Post {
  id: string;
  numericId: number;
  doctorId: string;
  doctorName: string;
  specialty: string;
  avatar: string;
  type: PostType;
  title: string;
  content: string;
  videoUrl?: string;
  time: string;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  isLikedByCurrentUser: boolean;
  tags: string[];
}

function apiPostToPost(p: ApiMagazinePost): Post {
  const initials = p.doctorName
    .split(" ")
    .filter(w => w[0])
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join("");
  const elapsed = (() => {
    const diff = Date.now() - new Date(p.createdAt).getTime();
    const h = Math.floor(diff / 3600000);
    if (h < 1) return "Just now";
    if (h < 24) return `${h}h ago`;
    const d = Math.floor(h / 24);
    return d === 1 ? "1 day ago" : `${d} days ago`;
  })();
  return {
    id: String(p.id),
    numericId: p.id,
    doctorId: String(p.doctorId),
    doctorName: p.doctorName,
    specialty: p.specialty,
    avatar: initials || "DR",
    type: p.type,
    title: p.title ?? "",
    content: p.content ?? "",
    videoUrl: p.mediaUrl ?? undefined,
    time: elapsed,
    likesCount: p.likesCount,
    commentsCount: p.commentsCount,
    sharesCount: p.sharesCount,
    isLikedByCurrentUser: p.isLikedByCurrentUser,
    tags: [],
  };
}

const typeFilters: { key: "all" | PostType; label: string; icon: React.ReactNode }[] = [
  { key: "all", label: "All", icon: <Newspaper className="h-4 w-4" /> },
  { key: "article", label: "Articles", icon: <FileText className="h-4 w-4" /> },
  { key: "video", label: "Videos", icon: <PlayCircle className="h-4 w-4" /> },
  { key: "tip", label: "Tips", icon: <TrendingUp className="h-4 w-4" /> },
];

function getTypeIcon(type: PostType) {
  switch (type) {
    case "article": return <FileText className="h-4 w-4" />;
    case "video": return <PlayCircle className="h-4 w-4" />;
    case "tip": return <TrendingUp className="h-4 w-4" />;
  }
}

function getTypeLabel(type: PostType) {
  switch (type) {
    case "article": return "Article";
    case "video": return "Video";
    case "tip": return "Health Tip";
  }
}

function formatCommentTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return "Just now";
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return d === 1 ? "1d ago" : `${d}d ago`;
}

/* ── PostCard ─────────────────────────────────────────────────────── */
function PostCard({ post, isRTL }: { post: Post; isRTL: boolean }) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  const [isExpanded, setIsExpanded] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [commentInput, setCommentInput] = useState("");
  const [isShared, setIsShared] = useState(false);

  /* Comments query — only fetches when section is expanded */
  const { data: comments = [], isLoading: commentsLoading } = useQuery<ApiPostComment[]>({
    queryKey: ["postComments", post.numericId],
    queryFn: () => getPostComments(post.numericId),
    enabled: isExpanded,
    staleTime: 60_000,
  });

  /* Optimistic like toggle */
  const likeMutation = useMutation({
    mutationFn: () => likePost(post.numericId),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["magazinePosts"] });
      const prev = queryClient.getQueryData<ApiMagazinePost[]>(["magazinePosts"]);
      queryClient.setQueryData<ApiMagazinePost[]>(["magazinePosts"], (old = []) =>
        old.map(p => p.id === post.numericId
          ? {
              ...p,
              isLikedByCurrentUser: !p.isLikedByCurrentUser,
              likesCount: p.likesCount + (p.isLikedByCurrentUser ? -1 : 1),
            }
          : p)
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(["magazinePosts"], ctx.prev);
      toast({ title: isRTL ? "فشل تسجيل الإعجاب" : "Failed to update like", variant: "destructive" });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["magazinePosts"] });
    },
  });

  /* Add comment */
  const commentMutation = useMutation({
    mutationFn: (text: string) => commentOnPost(post.numericId, text),
    onSuccess: () => {
      setCommentInput("");
      queryClient.invalidateQueries({ queryKey: ["postComments", post.numericId] });
      queryClient.setQueryData<ApiMagazinePost[]>(["magazinePosts"], (old = []) =>
        old.map(p => p.id === post.numericId ? { ...p, commentsCount: p.commentsCount + 1 } : p)
      );
    },
    onError: () => {
      toast({ title: isRTL ? "فشل إضافة التعليق" : "Failed to add comment", variant: "destructive" });
    },
  });

  /* Share — increments DB counter + native share UI */
  const shareMutation = useMutation({
    mutationFn: () => sharePost(post.numericId),
    onSuccess: (data) => {
      queryClient.setQueryData<ApiMagazinePost[]>(["magazinePosts"], (old = []) =>
        old.map(p => p.id === post.numericId ? { ...p, sharesCount: data.sharesCount } : p)
      );
    },
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
    const url = `${base}/doctor/${post.doctorId}`;
    const shareData = {
      title: post.title || `${isRTL ? "منشور من" : "Post by"} ${post.doctorName}`,
      text: isRTL
        ? `تحقق من هذه النصيحة الطبية من الدكتور ${post.doctorName} على إيجي دكتورز`
        : `Check out this medical advice from Dr. ${post.doctorName} on EGY Doctors.`,
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

  return (
    <Card className="bg-[#1E293B]/80 border-[#334155] overflow-hidden hover:border-[#D4A853]/30 transition-colors">
      <CardContent className="p-0">
        {/* Header */}
        <div className="p-5 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <Link href={`/doctor/${post.doctorId}`} className="shrink-0">
              <Avatar className="w-12 h-12 border-2 border-[#D4A853]/20 cursor-pointer hover:border-[#D4A853] transition-colors">
                <AvatarFallback className="bg-[#D4A853]/10 text-[#D4A853] font-bold">
                  {post.avatar}
                </AvatarFallback>
              </Avatar>
            </Link>
            <div className="min-w-0">
              <Link href={`/doctor/${post.doctorId}`}>
                <h3 className="font-semibold text-white hover:text-[#D4A853] transition-colors cursor-pointer truncate">
                  {post.doctorName}
                </h3>
              </Link>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm">
                <span className="text-gray-400">{post.specialty}</span>
                <span className="text-gray-600 hidden sm:inline">·</span>
                <span className="text-gray-500 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {post.time}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsFollowing(f => !f)}
              className={`h-8 text-xs px-3 transition-colors ${
                isFollowing
                  ? "bg-[#D4A853]/10 border-[#D4A853]/30 text-[#D4A853] hover:bg-[#D4A853]/20"
                  : "bg-transparent border-[#334155] text-gray-400 hover:border-[#D4A853]/50 hover:text-[#D4A853]"
              }`}
            >
              {isFollowing ? (
                <>
                  <UserCheck className="h-3 w-3 mr-1" />
                  <span className="hidden sm:inline">{isRTL ? "متابع" : "Following"}</span>
                </>
              ) : (
                <>
                  <UserPlus className="h-3 w-3 mr-1" />
                  <span className="hidden sm:inline">{isRTL ? "متابعة" : "Follow"}</span>
                </>
              )}
            </Button>
            <button className="text-gray-500 hover:text-gray-300 p-1 hidden sm:block">
              <MoreHorizontal className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-5 pb-4">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <Badge className="bg-[#D4A853]/10 text-[#D4A853] border-[#D4A853]/20 hover:bg-[#D4A853]/20 shrink-0">
              {getTypeIcon(post.type)}
              <span className="ml-1">{getTypeLabel(post.type)}</span>
            </Badge>
            {post.tags.map(tag => (
              <Badge
                key={tag}
                variant="outline"
                className="bg-[#0F172A]/50 border-[#334155] text-gray-400 text-xs shrink-0"
              >
                {tag}
              </Badge>
            ))}
          </div>
          {post.title && <h2 className="text-lg font-bold text-white mb-2">{post.title}</h2>}
          {post.content && <p className="text-gray-400 text-sm leading-relaxed">{post.content}</p>}
        </div>

        {/* Media */}
        {post.type === "video" && post.videoUrl && (
          <div className="mx-5 mb-4 rounded-lg overflow-hidden" style={{ aspectRatio: "16/9" }}>
            <iframe
              src={getEmbedUrl(post.videoUrl) ?? ""}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={post.title}
            />
          </div>
        )}

        {/* Action Bar */}
        <div className="px-5 py-3 border-t border-[#334155] flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Like */}
            <button
              onClick={handleLike}
              disabled={likeMutation.isPending}
              className={`flex items-center gap-1.5 text-sm transition-colors ${
                post.isLikedByCurrentUser ? "text-[#D4A853]" : "text-gray-400 hover:text-[#D4A853]"
              }`}
            >
              <Heart className={`h-5 w-5 ${post.isLikedByCurrentUser ? "fill-[#D4A853]" : ""}`} />
              <span>{post.likesCount}</span>
            </button>

            {/* Comment toggle */}
            <button
              onClick={() => setIsExpanded(e => !e)}
              className={`flex items-center gap-1.5 text-sm transition-colors ${
                isExpanded ? "text-[#D4A853]" : "text-gray-400 hover:text-[#D4A853]"
              }`}
            >
              <MessageCircle className="h-5 w-5" />
              <span>{post.commentsCount}</span>
            </button>

            {/* Share */}
            <button
              onClick={handleShare}
              className={`flex items-center gap-1.5 text-sm transition-colors ${
                isShared ? "text-[#D4A853]" : "text-gray-400 hover:text-[#D4A853]"
              }`}
            >
              <Share2 className="h-5 w-5" />
              <span>{isShared ? (isRTL ? "مشاركة!" : "Shared!") : post.sharesCount}</span>
            </button>
          </div>

          <button
            onClick={() => setIsBookmarked(b => !b)}
            className={`text-sm transition-colors ${
              isBookmarked ? "text-[#D4A853]" : "text-gray-400 hover:text-[#D4A853]"
            }`}
          >
            {isBookmarked ? <BookmarkCheck className="h-5 w-5" /> : <Bookmark className="h-5 w-5" />}
          </button>
        </div>

        {/* Comments Section */}
        {isExpanded && (
          <div className="px-5 py-4 border-t border-[#334155] bg-[#0F172A]/30">
            {commentsLoading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-[#D4A853]" />
              </div>
            ) : (
              <div className="space-y-4 mb-4">
                {comments.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-4">
                    {isRTL ? "لا توجد تعليقات بعد. كن أول معلق!" : "No comments yet. Be the first!"}
                  </p>
                ) : (
                  comments.map(comment => {
                    const initials = comment.userName
                      .split(" ")
                      .filter(w => w[0])
                      .slice(0, 2)
                      .map(w => w[0].toUpperCase())
                      .join("") || "U";
                    return (
                      <div key={comment.id} className="flex items-start gap-3">
                        <Avatar className="w-8 h-8 border border-[#334155]">
                          <AvatarFallback className="bg-[#1E293B] text-[#D4A853] text-xs font-bold">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="bg-[#1E293B] rounded-lg px-3 py-2">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm text-white">{comment.userName}</span>
                              <span className="text-xs text-gray-500">{formatCommentTime(comment.createdAt)}</span>
                            </div>
                            <p className="text-sm text-gray-300">{comment.text}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* Comment Input */}
            <div className="flex items-center gap-2">
              <Avatar className="w-8 h-8 border border-[#334155] shrink-0">
                <AvatarFallback className="bg-[#D4A853]/10 text-[#D4A853] text-xs font-bold">
                  {user
                    ? user.name.split(" ").filter(w => w[0]).slice(0, 2).map(w => w[0].toUpperCase()).join("")
                    : "?"}
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
                  className="bg-[#0F172A] border-[#334155] text-white placeholder:text-gray-500 focus-visible:ring-[#D4A853] focus-visible:ring-1 h-9 text-sm"
                />
                <Button
                  size="icon"
                  onClick={handleComment}
                  disabled={!user || commentMutation.isPending || !commentInput.trim()}
                  className="h-9 w-9 bg-[#D4A853] text-[#0F172A] hover:bg-[#C49A48] shrink-0"
                >
                  {commentMutation.isPending
                    ? <Loader2 className="h-4 w-4 animate-spin" />
                    : <Send className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* ── Magazine Page ─────────────────────────────────────────────────── */
export default function Magazine() {
  const { dir } = useLanguage();
  const isRTL = dir === "rtl";
  const [filter, setFilter] = useState<"all" | PostType>("all");

  const { data: apiPosts = [], isLoading: postsLoading } = useQuery<ApiMagazinePost[]>({
    queryKey: ["magazinePosts"],
    queryFn: () => getMagazinePosts(),
    staleTime: 30_000,
  });

  const allPosts: Post[] = apiPosts.map(apiPostToPost);
  const filteredPosts = filter === "all" ? allPosts : allPosts.filter(p => p.type === filter);

  return (
    <div className="min-h-screen bg-[#0F172A]" dir={dir}>
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            {isRTL ? "مجلة طبية" : "Medical Magazine"}
          </h1>
          <p className="text-gray-400">
            {isRTL
              ? "نصائح وأبحاث صحية من أفضل الأطباء في مصر"
              : "Health tips & insights from top Egyptian doctors"}
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
          <Filter className="h-4 w-4 text-gray-500 shrink-0" />
          {typeFilters.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                filter === f.key
                  ? "bg-[#D4A853] text-[#0F172A]"
                  : "bg-[#1E293B] text-gray-400 hover:bg-[#334155] hover:text-white"
              }`}
            >
              {f.icon}
              {f.label}
            </button>
          ))}
        </div>

        {/* Posts Feed */}
        <div className="space-y-6">
          {postsLoading && (
            <div className="py-16 text-center text-gray-500">
              <Newspaper className="h-10 w-10 mx-auto mb-3 opacity-30 text-[#D4A853]" />
              <p>{isRTL ? "جار تحميل المقالات..." : "Loading posts..."}</p>
            </div>
          )}
          {!postsLoading && filteredPosts.length === 0 && (
            <div className="py-16 text-center text-gray-500">
              <Newspaper className="h-10 w-10 mx-auto mb-3 opacity-30 text-[#D4A853]" />
              <p>{isRTL ? "لا توجد منشورات بعد. شجّع أطباءك على النشر!" : "No posts yet. Encourage your doctors to publish!"}</p>
            </div>
          )}
          {filteredPosts.map(post => (
            <PostCard key={post.id} post={post} isRTL={isRTL} />
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
}
