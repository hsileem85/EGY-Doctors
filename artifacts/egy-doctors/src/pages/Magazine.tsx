import { useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { getMagazinePosts, followDoctor, type ApiMagazinePost } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { SocialVideoPlayer } from "@/components/SocialVideoPlayer";
import {
  Bookmark, BookmarkCheck,
  PlayCircle, FileText, MoreHorizontal,
  Filter, TrendingUp, Clock, UserPlus, UserCheck, Newspaper,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PostInteractionBar } from "@/components/PostInteractionBar";

type PostType = "article" | "video" | "tip";

interface Post {
  id: string;
  numericId: number;
  doctorId: string;
  doctorName: string;
  doctorNameAr: string | null;
  specialty: string;
  specialtyAr: string;
  avatar: string;
  type: PostType;
  title: string;
  content: string;
  videoUrl?: string;
  createdAt: string;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  isLikedByCurrentUser: boolean;
  isFollowingDoctor: boolean;
  numericDoctorId: number;
  tags: string[];
}

function apiPostToPost(p: ApiMagazinePost): Post {
  const nameEn = p.doctorName ?? "Unknown";
  const initials = nameEn
    .split(" ")
    .filter(w => w[0])
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join("");
  return {
    id: String(p.id),
    numericId: p.id,
    doctorId: String(p.doctorId),
    doctorName: nameEn,
    doctorNameAr: p.doctorNameAr ?? null,
    specialty: p.specialty ?? "",
    specialtyAr: p.specialtyAr ?? "",
    avatar: initials || "DR",
    type: p.type,
    title: p.title ?? "",
    content: p.content ?? "",
    videoUrl: p.mediaUrl ?? undefined,
    createdAt: p.createdAt,
    likesCount: p.likesCount,
    commentsCount: p.commentsCount,
    sharesCount: p.sharesCount,
    isLikedByCurrentUser: p.isLikedByCurrentUser,
    isFollowingDoctor: p.isFollowingDoctor,
    numericDoctorId: p.doctorId,
    tags: [],
  };
}

function getElapsed(createdAt: string, isRTL: boolean): string {
  const diff = Date.now() - new Date(createdAt).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return isRTL ? "الآن" : "Just now";
  if (h < 24) return isRTL ? `منذ ${h} ساعة` : `${h}h ago`;
  const d = Math.floor(h / 24);
  if (isRTL) return d === 1 ? "منذ يوم" : `منذ ${d} أيام`;
  return d === 1 ? "1 day ago" : `${d} days ago`;
}

function getTypeLabel(type: PostType, isRTL: boolean): string {
  if (isRTL) {
    switch (type) {
      case "article": return "مقالة";
      case "video": return "فيديو";
      case "tip": return "نصيحة صحية";
    }
  }
  switch (type) {
    case "article": return "Article";
    case "video": return "Video";
    case "tip": return "Health Tip";
  }
}

/* ── PostCard ─────────────────────────────────────────────────────── */
function PostCard({ post, isRTL }: { post: Post; isRTL: boolean }) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();

  const displayName = isRTL ? (post.doctorNameAr ?? post.doctorName) : post.doctorName;
  const displaySpecialty = isRTL ? (post.specialtyAr || post.specialty) : post.specialty;
  const elapsed = getElapsed(post.createdAt, isRTL);

  const followMutation = useMutation({
    mutationFn: () => followDoctor(post.numericDoctorId),
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: ["magazinePosts"] });
      const prev = qc.getQueryData<ApiMagazinePost[]>(["magazinePosts"]);
      qc.setQueryData<ApiMagazinePost[]>(["magazinePosts"], (old = []) =>
        old.map(p =>
          p.doctorId === post.numericDoctorId
            ? { ...p, isFollowingDoctor: !post.isFollowingDoctor }
            : p
        )
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(["magazinePosts"], ctx.prev);
      toast({
        title: isRTL ? "تعذّر تحديث المتابعة" : "Failed to update follow",
        variant: "destructive",
      });
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["magazinePosts"] });
    },
  });

  const handleFollow = () => {
    if (!user) {
      toast({
        title: isRTL ? "يرجى تسجيل الدخول أولاً" : "Sign in to follow doctors",
      });
      return;
    }
    followMutation.mutate();
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
                  {displayName}
                </h3>
              </Link>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm">
                <span className="text-gray-400">{displaySpecialty}</span>
                <span className="text-gray-600 hidden sm:inline">·</span>
                <span className="text-gray-500 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {elapsed}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              size="sm"
              variant="outline"
              onClick={handleFollow}
              disabled={followMutation.isPending}
              className={`h-8 text-xs px-3 transition-colors ${
                post.isFollowingDoctor
                  ? "bg-[#D4A853]/10 border-[#D4A853]/30 text-[#D4A853] hover:bg-[#D4A853]/20"
                  : "bg-transparent border-[#334155] text-gray-400 hover:border-[#D4A853]/50 hover:text-[#D4A853]"
              }`}
            >
              {post.isFollowingDoctor ? (
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
              {post.type === "article" && <FileText className="h-4 w-4" />}
              {post.type === "video" && <PlayCircle className="h-4 w-4" />}
              {post.type === "tip" && <TrendingUp className="h-4 w-4" />}
              <span className={isRTL ? "mr-1" : "ml-1"}>{getTypeLabel(post.type, isRTL)}</span>
            </Badge>
            {post.tags.map(tag => (
              <Badge key={tag} variant="outline" className="bg-[#0F172A]/50 border-[#334155] text-gray-400 text-xs shrink-0">
                {tag}
              </Badge>
            ))}
          </div>
          {post.title && <h2 className="text-lg font-bold text-white mb-2">{post.title}</h2>}
          {post.content && <p className="text-gray-400 text-sm leading-relaxed">{post.content}</p>}
        </div>

        {/* Media */}
        {post.type === "video" && post.videoUrl && (
          <div className="mb-0 px-0">
            <SocialVideoPlayer url={post.videoUrl} title={post.title} />
          </div>
        )}

        {/* Interaction bar + bookmark row */}
        <div className="px-5 flex items-start gap-3">
          <div className="flex-1">
            <PostInteractionBar
              postId={post.numericId}
              initialLikesCount={post.likesCount}
              initialCommentsCount={post.commentsCount}
              initialSharesCount={post.sharesCount}
              isLikedByCurrentUser={post.isLikedByCurrentUser}
              doctorName={displayName}
              postTitle={post.title}
              doctorId={post.doctorId}
              isRTL={isRTL}
              variant="dark"
            />
          </div>
          <button
            onClick={() => setIsBookmarked(b => !b)}
            className={`mt-3 shrink-0 transition-colors ${
              isBookmarked ? "text-[#D4A853]" : "text-gray-400 hover:text-[#D4A853]"
            }`}
          >
            {isBookmarked ? <BookmarkCheck className="h-5 w-5" /> : <Bookmark className="h-5 w-5" />}
          </button>
        </div>
      </CardContent>
    </Card>
  );
}

/* ── Magazine Page ─────────────────────────────────────────────────── */
export default function Magazine() {
  const { dir } = useLanguage();
  const isRTL = dir === "rtl";
  const [filter, setFilter] = useState<"all" | PostType>("all");

  const typeFilters: { key: "all" | PostType; label: string; icon: React.ReactNode }[] = [
    { key: "all", label: isRTL ? "الكل" : "All", icon: <Newspaper className="h-4 w-4" /> },
    { key: "article", label: isRTL ? "مقالات" : "Articles", icon: <FileText className="h-4 w-4" /> },
    { key: "video", label: isRTL ? "فيديوهات" : "Videos", icon: <PlayCircle className="h-4 w-4" /> },
    { key: "tip", label: isRTL ? "نصائح" : "Tips", icon: <TrendingUp className="h-4 w-4" /> },
  ];

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

      <div className="max-w-3xl mx-auto px-4 py-8">
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
