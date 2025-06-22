import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  Settings, 
  Bell, 
  Bookmark, 
  Eye, 
  Edit, 
  Camera, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Heart,
  Share2,
  Download,
  Moon,
  Sun,
  Globe,
  Shield
} from "lucide-react";

export default function AccountPage() {
  const [isEditing, setIsEditing] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState("english");
  const [notifications, setNotifications] = useState({
    breaking: true,
    trending: true,
    email: false,
    push: true
  });

  // Mock user data
  const user = {
    name: "राहुल शर्मा",
    nameEnglish: "Rahul Sharma",
    email: "rahul.sharma@email.com",
    phone: "+91 98765 43210",
    location: "New Delhi, India",
    joinDate: "January 2023",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    bio: "समाचार प्रेमी और राजनीतिक विश्लेषक। न्यूज़ और करंट अफेयर्स में गहरी रुचि।",
    bioEnglish: "News enthusiast and political analyst. Deep interest in news and current affairs."
  };

  const readingStats = {
    articlesRead: 1247,
    timeSpent: "156 hours",
    favoriteCategory: "Politics",
    streak: 45
  };

  const recentActivity = [
    { type: "read", title: "Parliament Winter Session Updates", time: "2 hours ago" },
    { type: "bookmark", title: "Cricket World Cup Final Analysis", time: "5 hours ago" },
    { type: "share", title: "Economic Policy Changes", time: "1 day ago" },
    { type: "like", title: "Tech Innovation Showcase", time: "2 days ago" }
  ];

  const savedArticles = [
    {
      id: 1,
      title: "Parliament Winter Session: Key Bills Discussion",
      titleHindi: "संसद शीतकालीन सत्र: मुख्य विधेयकों पर चर्चा",
      category: "Politics",
      savedDate: "2 days ago",
      imageUrl: "https://images.unsplash.com/photo-1586765669224-68c13bc1ba04?w=150&h=100&fit=crop"
    },
    {
      id: 2,
      title: "Cricket World Cup Final: India vs Australia",
      titleHindi: "क्रिकेट विश्व कप फाइनल: भारत बनाम ऑस्ट्रेलिया",
      category: "Sports",
      savedDate: "3 days ago",
      imageUrl: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=150&h=100&fit=crop"
    },
    {
      id: 3,
      title: "Bollywood Breaking News Updates",
      titleHindi: "बॉलीवुड ब्रेकिंग न्यूज़ अपडेट",
      category: "Entertainment",
      savedDate: "1 week ago",
      imageUrl: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=150&h=100&fit=crop"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-800 dark:text-slate-100 mb-2">
            Account
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300 mb-4">
            Manage your profile and preferences
          </p>
          <p className="text-lg text-slate-600 dark:text-slate-300">
            अपनी प्रोफ़ाइल और प्राथमिकताएं प्रबंधित करें
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Section */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="text-center">
                <div className="relative inline-block">
                  <Avatar className="w-24 h-24 mx-auto">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="text-2xl">
                      {user.nameEnglish.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    size="sm"
                    className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0"
                  >
                    <Camera className="w-4 h-4" />
                  </Button>
                </div>
                <CardTitle className="mt-4">{user.name}</CardTitle>
                <p className="text-slate-600 dark:text-slate-300">{user.nameEnglish}</p>
                <Badge variant="outline" className="mt-2">
                  Premium Reader
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-slate-500" />
                    <span>{user.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-500" />
                    <span>{user.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-slate-500" />
                    <span>{user.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-500" />
                    <span>Joined {user.joinDate}</span>
                  </div>
                </div>
                <Separator className="my-4" />
                <div className="text-sm">
                  <p className="font-medium mb-2">Bio:</p>
                  <p className="text-slate-600 dark:text-slate-300 mb-2">{user.bio}</p>
                  <p className="text-slate-600 dark:text-slate-300">{user.bioEnglish}</p>
                </div>
              </CardContent>
            </Card>

            {/* Reading Stats */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Reading Stats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-red-600">{readingStats.articlesRead}</div>
                    <div className="text-xs text-slate-500">Articles Read</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{readingStats.timeSpent}</div>
                    <div className="text-xs text-slate-500">Time Spent</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">{readingStats.streak}</div>
                    <div className="text-xs text-slate-500">Day Streak</div>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-purple-600">{readingStats.favoriteCategory}</div>
                    <div className="text-xs text-slate-500">Favorite Topic</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="profile" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="profile" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Profile
                </TabsTrigger>
                <TabsTrigger value="saved" className="flex items-center gap-2">
                  <Bookmark className="w-4 h-4" />
                  Saved
                </TabsTrigger>
                <TabsTrigger value="activity" className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Activity
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Settings
                </TabsTrigger>
              </TabsList>

              <TabsContent value="profile" className="space-y-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Personal Information</CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(!isEditing)}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      {isEditing ? "Cancel" : "Edit"}
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Name (Hindi)</label>
                        <Input
                          value={user.name}
                          readOnly={!isEditing}
                          className={!isEditing ? "bg-slate-50 dark:bg-slate-800" : ""}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Name (English)</label>
                        <Input
                          value={user.nameEnglish}
                          readOnly={!isEditing}
                          className={!isEditing ? "bg-slate-50 dark:bg-slate-800" : ""}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Email</label>
                      <Input
                        value={user.email}
                        readOnly={!isEditing}
                        className={!isEditing ? "bg-slate-50 dark:bg-slate-800" : ""}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Phone</label>
                        <Input
                          value={user.phone}
                          readOnly={!isEditing}
                          className={!isEditing ? "bg-slate-50 dark:bg-slate-800" : ""}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Location</label>
                        <Input
                          value={user.location}
                          readOnly={!isEditing}
                          className={!isEditing ? "bg-slate-50 dark:bg-slate-800" : ""}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Bio (Hindi)</label>
                      <Textarea
                        value={user.bio}
                        readOnly={!isEditing}
                        className={!isEditing ? "bg-slate-50 dark:bg-slate-800" : ""}
                        rows={2}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Bio (English)</label>
                      <Textarea
                        value={user.bioEnglish}
                        readOnly={!isEditing}
                        className={!isEditing ? "bg-slate-50 dark:bg-slate-800" : ""}
                        rows={2}
                      />
                    </div>
                    {isEditing && (
                      <div className="flex gap-2">
                        <Button className="flex-1">Save Changes</Button>
                        <Button variant="outline" onClick={() => setIsEditing(false)}>
                          Cancel
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="saved" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Saved Articles ({savedArticles.length})</CardTitle>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      Your bookmarked articles for later reading
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {savedArticles.map((article) => (
                        <div key={article.id} className="flex gap-4 p-4 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer">
                          <img
                            src={article.imageUrl}
                            alt={article.title}
                            className="w-20 h-16 object-cover rounded flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold line-clamp-2 mb-1">
                              {article.title}
                            </h4>
                            <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-1 mb-2">
                              {article.titleHindi}
                            </p>
                            <div className="flex items-center justify-between">
                              <Badge variant="outline">{article.category}</Badge>
                              <span className="text-xs text-slate-500">Saved {article.savedDate}</span>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2">
                            <Button size="sm" variant="ghost">
                              <Share2 className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost">
                              <Download className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="activity" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      Your reading and interaction history
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentActivity.map((activity, index) => (
                        <div key={index} className="flex items-center gap-4 p-3 border rounded-lg">
                          <div className="p-2 rounded-full bg-slate-100 dark:bg-slate-800">
                            {activity.type === "read" && <Eye className="w-4 h-4" />}
                            {activity.type === "bookmark" && <Bookmark className="w-4 h-4" />}
                            {activity.type === "share" && <Share2 className="w-4 h-4" />}
                            {activity.type === "like" && <Heart className="w-4 h-4" />}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium capitalize">{activity.type} article</p>
                            <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-1">
                              {activity.title}
                            </p>
                          </div>
                          <span className="text-xs text-slate-500">{activity.time}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Preferences</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Language Settings */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Globe className="w-4 h-4" />
                        <h4 className="font-medium">Language / भाषा</h4>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant={language === "english" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setLanguage("english")}
                        >
                          English
                        </Button>
                        <Button
                          variant={language === "hindi" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setLanguage("hindi")}
                        >
                          हिंदी
                        </Button>
                        <Button
                          variant={language === "both" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setLanguage("both")}
                        >
                          Both / दोनों
                        </Button>
                      </div>
                    </div>

                    <Separator />

                    {/* Theme Settings */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        {darkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                        <h4 className="font-medium">Theme</h4>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant={!darkMode ? "default" : "outline"}
                          size="sm"
                          onClick={() => setDarkMode(false)}
                        >
                          <Sun className="w-4 h-4 mr-2" />
                          Light
                        </Button>
                        <Button
                          variant={darkMode ? "default" : "outline"}
                          size="sm"
                          onClick={() => setDarkMode(true)}
                        >
                          <Moon className="w-4 h-4 mr-2" />
                          Dark
                        </Button>
                      </div>
                    </div>

                    <Separator />

                    {/* Notification Settings */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Bell className="w-4 h-4" />
                        <h4 className="font-medium">Notifications</h4>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Breaking News Alerts</span>
                          <Button
                            variant={notifications.breaking ? "default" : "outline"}
                            size="sm"
                            onClick={() => setNotifications(prev => ({ ...prev, breaking: !prev.breaking }))}
                          >
                            {notifications.breaking ? "On" : "Off"}
                          </Button>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Trending Articles</span>
                          <Button
                            variant={notifications.trending ? "default" : "outline"}
                            size="sm"
                            onClick={() => setNotifications(prev => ({ ...prev, trending: !prev.trending }))}
                          >
                            {notifications.trending ? "On" : "Off"}
                          </Button>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Email Notifications</span>
                          <Button
                            variant={notifications.email ? "default" : "outline"}
                            size="sm"
                            onClick={() => setNotifications(prev => ({ ...prev, email: !prev.email }))}
                          >
                            {notifications.email ? "On" : "Off"}
                          </Button>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Push Notifications</span>
                          <Button
                            variant={notifications.push ? "default" : "outline"}
                            size="sm"
                            onClick={() => setNotifications(prev => ({ ...prev, push: !prev.push }))}
                          >
                            {notifications.push ? "On" : "Off"}
                          </Button>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Privacy & Security */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Shield className="w-4 h-4" />
                        <h4 className="font-medium">Privacy & Security</h4>
                      </div>
                      <div className="space-y-2">
                        <Button variant="outline" className="w-full justify-start">
                          Change Password
                        </Button>
                        <Button variant="outline" className="w-full justify-start">
                          Download My Data
                        </Button>
                        <Button variant="outline" className="w-full justify-start">
                          Privacy Settings
                        </Button>
                        <Button variant="destructive" className="w-full justify-start">
                          Delete Account
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}