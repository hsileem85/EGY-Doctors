import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { useLanguage } from "@/context/LanguageContext";
import { Link } from "wouter";
import { 
  FileText, Video, MessageSquare, CheckCircle2, 
  Heart, Brain, Shield, Activity, Stethoscope, Baby,
  PlayCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

type PublishedItem = {
  id: string;
  type: "article" | "video" | "advice";
  title: string;
  category: string;
  date: string;
};

const ICONS = [Heart, Brain, Shield, Activity, Stethoscope, Baby];

export default function PublishContent() {
  const { t, dir } = useLanguage();
  const [publishedItems, setPublishedItems] = useState<PublishedItem[]>([]);
  const [successTab, setSuccessTab] = useState<string | null>(null);

  // Article state
  const [article, setArticle] = useState({ title: "", category: "", coverUrl: "", content: "", tagInput: "", tags: [] as string[] });
  
  // Video state
  const [video, setVideo] = useState({ title: "", url: "", description: "" });
  
  // Advice state
  const [advice, setAdvice] = useState({ title: "", category: "", body: "", iconIdx: 0 });

  const categories = Object.entries(t.publish.categories).map(([k, v]) => ({ key: k, label: v as string }));

  const handlePublish = (type: "article" | "video" | "advice") => {
    let title = "";
    let category = "";
    
    if (type === "article") {
      title = article.title;
      category = article.category;
    } else if (type === "video") {
      title = video.title;
      category = "Video";
    } else {
      title = advice.title;
      category = advice.category;
    }

    const newItem: PublishedItem = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      title,
      category,
      date: new Date().toLocaleDateString(dir === 'rtl' ? 'ar-EG' : 'en-US')
    };

    setPublishedItems([newItem, ...publishedItems]);
    setSuccessTab(type);
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && article.tagInput.trim()) {
      e.preventDefault();
      if (!article.tags.includes(article.tagInput.trim())) {
        setArticle({
          ...article,
          tags: [...article.tags, article.tagInput.trim()],
          tagInput: ""
        });
      }
    }
  };

  const renderSuccess = (type: string, resetFn: () => void) => (
    <Card className="border-[#10B981]/20 bg-[#10B981]/5">
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 bg-[#10B981]/10 rounded-full flex items-center justify-center mb-4">
          <CheckCircle2 className="w-8 h-8 text-[#10B981]" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">{t.publish.publishedSuccessfully}</h3>
        <Button onClick={resetFn} variant="outline" className="mt-6" data-testid={`button-publish-another-${type}`}>
          {t.publish.publishAnother}
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <Layout>
      <div className="bg-gray-50/50 min-h-[calc(100vh-4rem)] py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">{t.publish.title}</h1>
          </div>

          <Tabs defaultValue="article" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="article" className="gap-2" data-testid="tab-article">
                <FileText className="w-4 h-4" />
                <span className="hidden sm:inline">{t.publish.tabs.article}</span>
              </TabsTrigger>
              <TabsTrigger value="video" className="gap-2" data-testid="tab-video">
                <Video className="w-4 h-4" />
                <span className="hidden sm:inline">{t.publish.tabs.video}</span>
              </TabsTrigger>
              <TabsTrigger value="advice" className="gap-2" data-testid="tab-advice">
                <MessageSquare className="w-4 h-4" />
                <span className="hidden sm:inline">{t.publish.tabs.advice}</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="article">
              {successTab === "article" ? renderSuccess("article", () => {
                setSuccessTab(null);
                setArticle({ title: "", category: "", coverUrl: "", content: "", tagInput: "", tags: [] });
              }) : (
                <Card>
                  <CardContent className="pt-6 space-y-4">
                    <div className="space-y-2">
                      <Label>{t.publish.articleTitle}</Label>
                      <Input 
                        value={article.title} 
                        onChange={e => setArticle({...article, title: e.target.value})} 
                        data-testid="input-article-title"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>{t.publish.category}</Label>
                        <Select value={article.category} onValueChange={v => setArticle({...article, category: v})}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {categories.map(c => (
                              <SelectItem key={c.key} value={c.label}>{c.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>{t.publish.coverImage}</Label>
                        <Input 
                          placeholder="https://..." 
                          value={article.coverUrl} 
                          onChange={e => setArticle({...article, coverUrl: e.target.value})} 
                          data-testid="input-article-cover"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>{t.publish.content}</Label>
                      <Textarea 
                        className="min-h-[200px]" 
                        value={article.content} 
                        onChange={e => setArticle({...article, content: e.target.value})} 
                        data-testid="textarea-article-content"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>{t.publish.tags}</Label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {article.tags.map(tag => (
                          <Badge key={tag} variant="secondary" className="px-2 py-1">
                            {tag}
                            <button 
                              className="ms-2 text-gray-500 hover:text-red-500"
                              onClick={() => setArticle({...article, tags: article.tags.filter(t => t !== tag)})}
                            >×</button>
                          </Badge>
                        ))}
                      </div>
                      <Input 
                        value={article.tagInput} 
                        onChange={e => setArticle({...article, tagInput: e.target.value})} 
                        onKeyDown={handleTagKeyDown}
                        placeholder={t.publish.tags}
                        data-testid="input-article-tags"
                      />
                    </div>

                    <Button 
                      className="w-full mt-6" 
                      onClick={() => handlePublish("article")}
                      disabled={!article.title || !article.category || !article.content}
                      data-testid="button-publish-article"
                    >
                      {t.publish.publishArticle}
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="video">
              {successTab === "video" ? renderSuccess("video", () => {
                setSuccessTab(null);
                setVideo({ title: "", url: "", description: "" });
              }) : (
                <Card>
                  <CardContent className="pt-6 space-y-4">
                    <div className="space-y-2">
                      <Label>{t.publish.videoTitle}</Label>
                      <Input 
                        value={video.title} 
                        onChange={e => setVideo({...video, title: e.target.value})} 
                        data-testid="input-video-title"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>{t.publish.youtubeUrl}</Label>
                      <Input 
                        placeholder="https://youtube.com/watch?v=..." 
                        value={video.url} 
                        onChange={e => setVideo({...video, url: e.target.value})} 
                        data-testid="input-video-url"
                      />
                      {video.url && (
                        <div className="mt-4 aspect-video bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-200">
                          <PlayCircle className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>{t.publish.description}</Label>
                      <Textarea 
                        className="min-h-[120px]" 
                        value={video.description} 
                        onChange={e => setVideo({...video, description: e.target.value})} 
                        data-testid="textarea-video-desc"
                      />
                    </div>

                    <Button 
                      className="w-full mt-6" 
                      onClick={() => handlePublish("video")}
                      disabled={!video.title || !video.url}
                      data-testid="button-publish-video"
                    >
                      {t.publish.publishVideo}
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="advice">
              {successTab === "advice" ? renderSuccess("advice", () => {
                setSuccessTab(null);
                setAdvice({ title: "", category: "", body: "", iconIdx: 0 });
              }) : (
                <Card>
                  <CardContent className="pt-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>{t.publish.adviceTitle}</Label>
                        <Input 
                          value={advice.title} 
                          onChange={e => setAdvice({...advice, title: e.target.value})} 
                          data-testid="input-advice-title"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{t.publish.category}</Label>
                        <Select value={advice.category} onValueChange={v => setAdvice({...advice, category: v})}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {categories.map(c => (
                              <SelectItem key={c.key} value={c.label}>{c.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>{t.publish.adviceBody}</Label>
                      <Textarea 
                        className="min-h-[100px]" 
                        value={advice.body} 
                        onChange={e => setAdvice({...advice, body: e.target.value})} 
                        placeholder="Short, actionable advice in 2-3 sentences..."
                        data-testid="textarea-advice-body"
                      />
                    </div>

                    <div className="space-y-3">
                      <Label>{t.publish.icon}</Label>
                      <div className="flex gap-4">
                        {ICONS.map((Icon, idx) => (
                          <button
                            key={idx}
                            onClick={() => setAdvice({...advice, iconIdx: idx})}
                            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                              advice.iconIdx === idx 
                                ? 'bg-primary text-white shadow-md scale-110' 
                                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                            }`}
                          >
                            <Icon className="w-6 h-6" />
                          </button>
                        ))}
                      </div>
                    </div>

                    <Button 
                      className="w-full mt-8" 
                      onClick={() => handlePublish("advice")}
                      disabled={!advice.title || !advice.category || !advice.body}
                      data-testid="button-publish-advice"
                    >
                      {t.publish.publishAdvice}
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>

          {publishedItems.length > 0 && (
            <div className="mt-12">
              <h2 className="text-xl font-bold text-gray-900 mb-6">{t.publish.recentlyPublished}</h2>
              <div className="grid gap-4">
                {publishedItems.map(item => (
                  <Card key={item.id}>
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        item.type === 'article' ? 'bg-blue-100 text-blue-600' :
                        item.type === 'video' ? 'bg-red-100 text-red-600' :
                        'bg-yellow-100 text-yellow-600'
                      }`}>
                        {item.type === 'article' ? <FileText className="w-6 h-6" /> :
                         item.type === 'video' ? <Video className="w-6 h-6" /> :
                         <MessageSquare className="w-6 h-6" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-gray-900 truncate">{item.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs font-normal bg-gray-50">{item.category}</Badge>
                          <span className="text-xs text-gray-400">{item.date}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
