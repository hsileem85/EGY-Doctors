import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { getMagazinePosts, type ApiMagazinePost } from "@/lib/api";
import { getEmbedUrl } from "@/lib/youtube";
import {
  Heart, MessageCircle, Share2, Bookmark, BookmarkCheck,
  PlayCircle, FileText, MoreHorizontal, Send,
  Filter, TrendingUp, Clock, UserPlus, UserCheck, Newspaper
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

interface Comment {
  id: string;
  author: string;
  avatar: string;
  text: string;
  time: string;
  likes: number;
}

interface Post {
  id: string;
  doctorId: string;
  doctorName: string;
  specialty: string;
  avatar: string;
  type: PostType;
  title: string;
  content: string;
  image?: string;
  videoUrl?: string;
  time: string;
  likes: number;
  comments: Comment[];
  shares: number;
  bookmarks: number;
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
    doctorId: String(p.doctorId),
    doctorName: p.doctorName,
    specialty: p.specialty,
    avatar: initials || "DR",
    type: p.type,
    title: p.title ?? "",
    content: p.content ?? "",
    videoUrl: p.mediaUrl ?? undefined,
    time: elapsed,
    likes: 0,
    comments: [],
    shares: 0,
    bookmarks: 0,
    tags: [],
  };
}

const typeFilters: { key: "all" | PostType; label: string; icon: React.ReactNode }[] = [
  { key: "all", label: "All", icon: <Newspaper className="h-4 w-4" /> },
  { key: "article", label: "Articles", icon: <FileText className="h-4 w-4" /> },
  { key: "video", label: "Videos", icon: <PlayCircle className="h-4 w-4" /> },
  { key: "tip", label: "Tips", icon: <TrendingUp className="h-4 w-4" /> },
];

export default function Magazine() {
  const { dir, lang } = useLanguage();
  const isRTL = dir === "rtl";
  const [filter, setFilter] = useState<"all" | PostType>("all");
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [bookmarkedPosts, setBookmarkedPosts] = useState<Set<string>>(new Set());
  const [followedDoctors, setFollowedDoctors] = useState<Set<string>>(new Set());
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [postComments, setPostComments] = useState<Record<string, Comment[]>>({});
  const [postLikes, setPostLikes] = useState<Record<string, number>>({});
  const [sharedPosts, setSharedPosts] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const { data: apiPosts = [], isLoading: postsLoading } = useQuery<ApiMagazinePost[]>({
    queryKey: ["magazinePosts"],
    queryFn: () => getMagazinePosts(),
    staleTime: 30000,
  });

  const allPosts: Post[] = apiPosts.map(apiPostToPost);
  const filteredPosts = filter === "all" ? allPosts : allPosts.filter(p => p.type === filter);

  const toggleLike = (postId: string) => {
    setLikedPosts(prev => {
      const next = new Set(prev);
      if (next.has(postId)) {
        next.delete(postId);
        setPostLikes(l => ({ ...l, [postId]: (l[postId] || 0) - 1 }));
      } else {
        next.add(postId);
        setPostLikes(l => ({ ...l, [postId]: (l[postId] || 0) + 1 }));
      }
      return next;
    });
  };

  const toggleBookmark = (postId: string) => {
    setBookmarkedPosts(prev => {
      const next = new Set(prev);
      if (next.has(postId)) next.delete(postId);
      else next.add(postId);
      return next;
    });
  };

  const toggleFollow = (doctorId: string) => {
    setFollowedDoctors(prev => {
      const next = new Set(prev);
      if (next.has(doctorId)) next.delete(doctorId);
      else next.add(doctorId);
      return next;
    });
  };

  const toggleComments = (postId: string) => {
    setExpandedComments(prev => {
      const next = new Set(prev);
      if (next.has(postId)) next.delete(postId);
      else next.add(postId);
      return next;
    });
  };

  const handleShare = async (post: Post) => {
    const base = window.location.origin + (import.meta.env.BASE_URL ?? "/").replace(/\/$/, "");
    const url = `${base}/profile/${post.doctorId}`;
    const shareData = {
      title: post.title || `${isRTL ? "منشور من" : "Post by"} ${post.doctorName}`,
      text: `${isRTL ? `تحقق من هذه النصيحة الطبية من الدكتور ${post.doctorName} على إيجي دكتورز` : `Check out this medical advice from Dr. ${post.doctorName} on EGY Doctors.`}`,
      url,
    };

    setSharedPosts(prev => new Set(prev).add(post.id));
    setTimeout(() => {
      setSharedPosts(prev => { const n = new Set(prev); n.delete(post.id); return n; });
    }, 2000);

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // user dismissed — no action needed
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        toast({ title: isRTL ? "تم نسخ الرابط!" : "Link copied to clipboard!" });
      } catch {
        toast({ title: isRTL ? "تعذر نسخ الرابط" : "Could not copy link", variant: "destructive" });
      }
    }
  };

  const addComment = (postId: string) => {
    const text = commentInputs[postId]?.trim();
    if (!text) return;
    const newComment: Comment = {
      id: `c-${Date.now()}`,
      author: "You",
      avatar: "YO",
      text,
      time: "Just now",
      likes: 0,
    };
    setPostComments(prev => ({
      ...prev,
      [postId]: [...(prev[postId] || []), newComment],
    }));
    setCommentInputs(prev => ({ ...prev, [postId]: "" }));
  };

  const getTypeIcon = (type: PostType) => {
    switch (type) {
      case "article": return <FileText className="h-4 w-4" />;
      case "video": return <PlayCircle className="h-4 w-4" />;
      case "tip": return <TrendingUp className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: PostType) => {
    switch (type) {
      case "article": return isRTL ? "مقال" : "Article";
      case "video": return isRTL ? "فيديو" : "Video";
      case "tip": return isRTL ? "نصيحة" : "Tip";
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A]">
      <Navbar />

      {/* Hero Header */}
      <div className="bg-[#0F172A] border-b border-[#1E293B]">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-2xl font-bold text-white">
                {isRTL ? "ما يقوله الأطباء" : "What Doctors Say"}
              </h1>
              <p className="text-sm text-gray-400">
                {isRTL
                  ? "تبادل المعرفة الطبية، تابع أفضل الأطباء"
                  : "Health insights, articles, and videos from Egypt's top doctors"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Filter Tabs */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          <Filter className="h-4 w-4 text-[#D4A853] shrink-0" />
          {typeFilters.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                filter === f.key
                  ? "bg-[#D4A853] text-[#0F172A]"
                  : "bg-[#1E293B] text-gray-400 hover:text-white hover:bg-[#334155]"
              }`}
            >
              {f.icon}
              {f.label}
            </button>
          ))}
        </div>

        {/* Trending Topics */}
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          <span className="text-sm text-gray-500">{isRTL ? "الأكثر تدولاً:" : "Trending:"}</span>
          {["Heart Health", "Skincare", "Nutrition", "Mental Health", "Pediatrics"].map(tag => (
            <Badge
              key={tag}
              variant="outline"
              className="bg-[#1E293B]/50 border-[#334155] text-[#D4A853] hover:bg-[#D4A853]/10 cursor-pointer"
            >
              {tag}
            </Badge>
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
          {filteredPosts.map(post => {
            const isLiked = likedPosts.has(post.id);
            const isBookmarked = bookmarkedPosts.has(post.id);
            const isFollowing = followedDoctors.has(post.doctorId);
            const isExpanded = expandedComments.has(post.id);
            const comments = postComments[post.id] || [];
            const likes = postLikes[post.id] || 0;
            const isShared = sharedPosts.has(post.id);

            return (
              <Card
                key={post.id}
                className="bg-[#1E293B]/80 border-[#334155] overflow-hidden hover:border-[#D4A853]/30 transition-colors"
              >
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
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleFollow(post.doctorId)}
                        className={`h-8 px-2 text-xs border transition-all ${
                          isFollowing
                            ? "bg-[#D4A853]/10 border-[#D4A853]/30 text-[#D4A853] hover:bg-[#D4A853]/20"
                            : "bg-transparent border-[#334155] text-gray-400 hover:text-[#D4A853] hover:border-[#D4A853]/50"
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
                    <h2 className="text-lg font-bold text-white mb-2">{post.title}</h2>
                    <p className="text-gray-400 text-sm leading-relaxed">{post.content}</p>
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
                      <button
                        onClick={() => toggleLike(post.id)}
                        className={`flex items-center gap-1.5 text-sm transition-colors ${
                          isLiked ? "text-[#D4A853]" : "text-gray-400 hover:text-[#D4A853]"
                        }`}
                      >
                        <Heart className={`h-5 w-5 ${isLiked ? "fill-[#D4A853]" : ""}`} />
                        <span>{likes}</span>
                      </button>

                      <button
                        onClick={() => toggleComments(post.id)}
                        className={`flex items-center gap-1.5 text-sm transition-colors ${
                          isExpanded ? "text-[#D4A853]" : "text-gray-400 hover:text-[#D4A853]"
                        }`}
                      >
                        <MessageCircle className="h-5 w-5" />
                        <span>{comments.length}</span>
                      </button>

                      <button
                        onClick={() => handleShare(post)}
                        className={`flex items-center gap-1.5 text-sm transition-colors ${
                          isShared ? "text-[#D4A853]" : "text-gray-400 hover:text-[#D4A853]"
                        }`}
                      >
                        <Share2 className="h-5 w-5" />
                        <span>{isShared ? (isRTL ? "مشاركة!" : "Shared!") : post.shares}</span>
                      </button>
                    </div>

                    <button
                      onClick={() => toggleBookmark(post.id)}
                      className={`text-sm transition-colors ${
                        isBookmarked ? "text-[#D4A853]" : "text-gray-400 hover:text-[#D4A853]"
                      }`}
                    >
                      {isBookmarked ? (
                        <BookmarkCheck className="h-5 w-5" />
                      ) : (
                        <Bookmark className="h-5 w-5" />
                      )}
                    </button>
                  </div>

                  {/* Comments Section */}
                  {isExpanded && (
                    <div className="px-5 py-4 border-t border-[#334155] bg-[#0F172A]/30">
                      <div className="space-y-4 mb-4">
                        {comments.length === 0 ? (
                          <p className="text-gray-500 text-sm text-center py-4">
                            {isRTL ? "لا توجد تعليقات بعد. كن أول معلق!" : "No comments yet. Be the first!"}
                          </p>
                        ) : (
                          comments.map(comment => (
                            <div key={comment.id} className="flex items-start gap-3">
                              <Avatar className="w-8 h-8 border border-[#334155]">
                                <AvatarFallback className="bg-[#1E293B] text-[#D4A853] text-xs font-bold">
                                  {comment.avatar}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="bg-[#1E293B] rounded-lg px-3 py-2">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium text-sm text-white">{comment.author}</span>
                                    <span className="text-xs text-gray-500">{comment.time}</span>
                                  </div>
                                  <p className="text-sm text-gray-300">{comment.text}</p>
                                </div>
                                <div className="flex items-center gap-3 mt-1 ml-2">
                                  <button className="text-xs text-gray-500 hover:text-[#D4A853]">
                                    {isRTL ? "إعجاب" : "Reply"}
                                  </button>
                                  <button className="text-xs text-gray-500 hover:text-[#D4A853] flex items-center gap-1">
                                    <Heart className="h-3 w-3" />
                                    {comment.likes}
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Comment Input */}
                      <div className="flex items-center gap-2">
                        <Avatar className="w-8 h-8 border border-[#334155] shrink-0">
                          <AvatarFallback className="bg-[#D4A853]/10 text-[#D4A853] text-xs font-bold">
                            YO
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 flex items-center gap-2">
                          <Input
                            value={commentInputs[post.id] || ""}
                            onChange={e => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                            onKeyDown={e => {
                              if (e.key === "Enter") addComment(post.id);
                            }}
                            placeholder={isRTL ? "أكتب تعليقاً..." : "Write a comment..."}
                            className="bg-[#0F172A] border-[#334155] text-white placeholder:text-gray-500 focus-visible:ring-[#D4A853] focus-visible:ring-1 h-9 text-sm"
                          />
                          <Button
                            size="icon"
                            onClick={() => addComment(post.id)}
                            className="h-9 w-9 bg-[#D4A853] text-[#0F172A] hover:bg-[#C49A48] shrink-0"
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <Footer />
    </div>
  );
}
