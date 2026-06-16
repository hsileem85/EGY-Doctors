import { useState } from "react";
import { Link } from "wouter";
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

const mockPosts: Post[] = [
  {
    id: "1",
    doctorId: "d1",
    doctorName: "Dr. Ahmed Youssef",
    specialty: "Cardiology",
    avatar: "AY",
    type: "article",
    title: "5 Signs Your Heart is Healthier Than You Think",
    content: "Many people worry about their heart health without realizing the positive signs already present. Regular exercise, stable blood pressure, and good cholesterol levels are all indicators that your heart is performing well. In this article, I break down the top 5 signs that suggest your cardiovascular system is in great shape...",
    image: "https://images.unsplash.com/photo-1628348070888-cb656235b4eb?w=800&q=80",
    time: "2 hours ago",
    likes: 234,
    comments: [
      { id: "c1", author: "Sarah M.", avatar: "SM", text: "Very helpful! I've been exercising regularly and this is encouraging.", time: "1 hour ago", likes: 12 }
    ],
    shares: 45,
    bookmarks: 67,
    tags: ["Heart Health", "Wellness", "Prevention"]
  },
  {
    id: "2",
    doctorId: "d2",
    doctorName: "Dr. Nour Hassan",
    specialty: "Dermatology",
    avatar: "NH",
    type: "video",
    title: "Summer Skincare Routine for Oily Skin",
    content: "A complete 5-minute skincare routine specifically designed for oily skin during hot summer months. Includes product recommendations and application tips.",
    videoUrl: "https://www.youtube.com/embed/placeholder",
    image: "https://images.unsplash.com/photo-1556228578-0d85b1a4d4a5?w=800&q=80",
    time: "5 hours ago",
    likes: 567,
    comments: [
      { id: "c2", author: "Lina K.", avatar: "LK", text: "Finally a routine that works! My skin has improved so much.", time: "3 hours ago", likes: 28 }
    ],
    shares: 123,
    bookmarks: 189,
    tags: ["Skincare", "Summer", "Dermatology"]
  },
  {
    id: "3",
    doctorId: "d3",
    doctorName: "Dr. Karim Fathy",
    specialty: "Pediatrics",
    avatar: "KF",
    type: "tip",
    title: "Quick Tip: When to Worry About a Fever",
    content: "Not every fever requires a doctor visit. Here's when you should be concerned: infants under 3 months with 100.4°F (38°C), fever lasting more than 3 days, or accompanying symptoms like rash, stiff neck, or difficulty breathing. Always trust your parental instincts — when in doubt, call your pediatrician.",
    time: "8 hours ago",
    likes: 892,
    comments: [
      { id: "c3", author: "Maya R.", avatar: "MR", text: "As a new mom, this is exactly what I needed. Thank you Dr. Karim!", time: "6 hours ago", likes: 45 }
    ],
    shares: 234,
    bookmarks: 156,
    tags: ["Pediatrics", "Parenting", "Health Tips"]
  },
  {
    id: "4",
    doctorId: "d4",
    doctorName: "Dr. Sara Mahmoud",
    specialty: "Nutrition",
    avatar: "SM",
    type: "article",
    title: "The Mediterranean Diet: A Cardiologist's Perspective",
    content: "After 15 years of clinical practice, I've seen the Mediterranean diet transform patient outcomes more than any prescription. The combination of olive oil, fish, nuts, and vegetables creates a powerful anti-inflammatory effect...",
    image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&q=80",
    time: "1 day ago",
    likes: 445,
    comments: [
      { id: "c4", author: "Omar H.", avatar: "OH", text: "I've been following this for 6 months and my cholesterol dropped significantly!", time: "20 hours ago", likes: 34 }
    ],
    shares: 89,
    bookmarks: 234,
    tags: ["Nutrition", "Heart Health", "Diet"]
  },
  {
    id: "5",
    doctorId: "d1",
    doctorName: "Dr. Ahmed Youssef",
    specialty: "Cardiology",
    avatar: "AY",
    type: "video",
    title: "Understanding Blood Pressure Readings",
    content: "What do those two numbers really mean? I explain systolic vs diastolic pressure in under 3 minutes with visual examples.",
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80",
    time: "2 days ago",
    likes: 1234,
    comments: [],
    shares: 345,
    bookmarks: 567,
    tags: ["Cardiology", "Blood Pressure", "Education"]
  },
  {
    id: "6",
    doctorId: "d5",
    doctorName: "Dr. Layla Omar",
    specialty: "Mental Health",
    avatar: "LO",
    type: "tip",
    title: "The 4-7-8 Breathing Technique for Anxiety",
    content: "Breathe in for 4 seconds, hold for 7, exhale for 8. This simple technique activates your parasympathetic nervous system and can reduce anxiety in under 2 minutes. I recommend it to all my patients dealing with stress and panic attacks.",
    time: "3 days ago",
    likes: 2345,
    comments: [
      { id: "c5", author: "Hassan A.", avatar: "HA", text: "Tried this during a panic attack and it worked. Thank you for sharing.", time: "2 days ago", likes: 67 }
    ],
    shares: 567,
    bookmarks: 890,
    tags: ["Mental Health", "Anxiety", "Self-Care"]
  }
];

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
  const [postComments, setPostComments] = useState<Record<string, Comment[]>>(() => {
    const map: Record<string, Comment[]> = {};
    mockPosts.forEach(p => { map[p.id] = p.comments; });
    return map;
  });
  const [postLikes, setPostLikes] = useState<Record<string, number>>(() => {
    const map: Record<string, number> = {};
    mockPosts.forEach(p => { map[p.id] = p.likes; });
    return map;
  });
  const [sharedPosts, setSharedPosts] = useState<Set<string>>(new Set());

  const filteredPosts = filter === "all" ? mockPosts : mockPosts.filter(p => p.type === filter);

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

  const handleShare = (postId: string) => {
    setSharedPosts(prev => new Set(prev).add(postId));
    setTimeout(() => {
      setSharedPosts(prev => {
        const next = new Set(prev);
        next.delete(postId);
        return next;
      });
    }, 2000);
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
            {/* Stethoscope SVG Icon */}
            <svg viewBox="0 0 24 36" className="w-8 h-10 shrink-0" fill="none">
              <path d="M12 16 C10 13, 7 9, 4 4" stroke="#D4A853" strokeWidth="4" strokeLinecap="round"/>
              <path d="M12 16 C14 13, 17 9, 20 4" stroke="#D4A853" strokeWidth="4" strokeLinecap="round"/>
              <path d="M12 16 L12 25" stroke="#D4A853" strokeWidth="4" strokeLinecap="round"/>
              <circle cx="12" cy="29" r="6" fill="#D4A853"/>
              <circle cx="12" cy="29" r="3.5" fill="white"/>
              <circle cx="4" cy="3" r="4" fill="#D4A853"/>
              <circle cx="4" cy="3" r="2" fill="white"/>
              <circle cx="20" cy="3" r="4" fill="#D4A853"/>
              <circle cx="20" cy="3" r="2" fill="white"/>
              <circle cx="12" cy="16" r="3.5" fill="#D4A853"/>
              <circle cx="12" cy="16" r="1.5" fill="white"/>
              <path d="M12 16 C10 13, 7 9, 4 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.4"/>
              <path d="M12 16 C14 13, 17 9, 20 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.4"/>
              <path d="M12 16 L12 25" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.4"/>
            </svg>
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
                  {post.image && (
                    <div className="relative mx-5 mb-4 rounded-lg overflow-hidden">
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-64 object-cover"
                        loading="lazy"
                      />
                      {post.type === "video" && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                          <div className="w-16 h-16 rounded-full bg-[#D4A853] flex items-center justify-center shadow-lg shadow-[#D4A853]/30 cursor-pointer hover:scale-110 transition-transform">
                            <PlayCircle className="h-8 w-8 text-[#0F172A]" />
                          </div>
                        </div>
                      )}
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
                        onClick={() => handleShare(post.id)}
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
