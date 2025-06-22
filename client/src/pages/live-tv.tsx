import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Users, Volume2, VolumeX, Maximize, MoreVertical } from "lucide-react";
import Header from "@/components/Header";

interface LiveStream {
  id: number;
  name: string;
  nameHindi: string;
  description: string;
  thumbnailUrl: string;
  viewerCount: number;
  isLive: boolean;
  category: string;
}

export default function LiveTVPage() {
  const [selectedStream, setSelectedStream] = useState<LiveStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);

  // Mock live streams data
  const liveStreams: LiveStream[] = [
    {
      id: 1,
      name: "Justice Wave Live",
      nameHindi: "जस्टिस वेव लाइव",
      description: "24/7 News Coverage",
      thumbnailUrl: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&h=250&fit=crop",
      viewerCount: 12450,
      isLive: true,
      category: "News"
    },
    {
      id: 2,
      name: "Breaking News Channel",
      nameHindi: "ब्रेकिंग न्यूज़ चैनल",
      description: "Latest Breaking News",
      thumbnailUrl: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&h=250&fit=crop",
      viewerCount: 8920,
      isLive: true,
      category: "Breaking"
    },
    {
      id: 3,
      name: "Sports Live",
      nameHindi: "स्पोर्ट्स लाइव",
      description: "Live Sports Coverage",
      thumbnailUrl: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400&h=250&fit=crop",
      viewerCount: 15230,
      isLive: true,
      category: "Sports"
    },
    {
      id: 4,
      name: "Entertainment Tonight",
      nameHindi: "एंटरटेनमेंट टुनाइट",
      description: "Bollywood & Entertainment",
      thumbnailUrl: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=400&h=250&fit=crop",
      viewerCount: 6780,
      isLive: false,
      category: "Entertainment"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-800 dark:text-slate-100 mb-2">
            Live TV
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300 mb-4">
            Watch live news and entertainment channels
          </p>
          <p className="text-lg text-slate-600 dark:text-slate-300 mb-4">
            लाइव न्यूज़ और मनोरंजन चैनल देखें
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Video Player */}
          <div className="lg:col-span-2">
            {selectedStream ? (
              <Card className="bg-black">
                <CardContent className="p-0">
                  <div className="relative aspect-video bg-slate-900 rounded-lg overflow-hidden">
                    <img
                      src={selectedStream.thumbnailUrl}
                      alt={selectedStream.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                      <Button size="lg" className="bg-red-600 hover:bg-red-700">
                        <Play className="w-8 h-8 mr-2" />
                        Play Live Stream
                      </Button>
                    </div>
                    
                    {/* Live indicator */}
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-red-600 text-white animate-pulse">
                        🔴 LIVE
                      </Badge>
                    </div>

                    {/* Viewer count */}
                    <div className="absolute top-4 right-4 bg-black bg-opacity-50 rounded-lg px-3 py-1 flex items-center gap-2">
                      <Users className="w-4 h-4 text-white" />
                      <span className="text-white text-sm">
                        {selectedStream.viewerCount.toLocaleString()}
                      </span>
                    </div>

                    {/* Video controls */}
                    <div className="absolute bottom-4 right-4 flex gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setIsMuted(!isMuted)}
                      >
                        {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                      </Button>
                      <Button size="sm" variant="secondary">
                        <Maximize className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="secondary">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
                <CardHeader>
                  <CardTitle className="text-xl">{selectedStream.name}</CardTitle>
                  <p className="text-slate-600 dark:text-slate-300">
                    {selectedStream.nameHindi}
                  </p>
                  <p className="text-sm text-slate-500">
                    {selectedStream.description}
                  </p>
                </CardHeader>
              </Card>
            ) : (
              <Card className="bg-slate-100 dark:bg-slate-800">
                <CardContent className="p-8 text-center">
                  <div className="aspect-video flex items-center justify-center bg-slate-200 dark:bg-slate-700 rounded-lg">
                    <div className="text-center">
                      <Play className="w-16 h-16 mx-auto mb-4 text-slate-400" />
                      <h3 className="text-xl font-semibold mb-2">Select a Live Channel</h3>
                      <p className="text-slate-600 dark:text-slate-300">
                        Choose from the available channels to start watching
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Channel List */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-4">Available Channels</h2>
            {liveStreams.map((stream) => (
              <Card
                key={stream.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                  selectedStream?.id === stream.id
                    ? "ring-2 ring-red-500 bg-red-50 dark:bg-red-900/20"
                    : "hover:bg-slate-50 dark:hover:bg-slate-700"
                }`}
                onClick={() => setSelectedStream(stream)}
              >
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    <div className="relative">
                      <img
                        src={stream.thumbnailUrl}
                        alt={stream.name}
                        className="w-20 h-12 object-cover rounded"
                      />
                      {stream.isLive && (
                        <Badge className="absolute -top-1 -right-1 text-xs bg-red-600 text-white">
                          LIVE
                        </Badge>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm truncate">
                        {stream.name}
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-300 truncate">
                        {stream.nameHindi}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {stream.description}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Users className="w-3 h-3 text-slate-400" />
                        <span className="text-xs text-slate-500">
                          {stream.viewerCount.toLocaleString()}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {stream.category}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Channel Categories */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Browse by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {["News", "Sports", "Entertainment", "Politics"].map((category) => (
              <Card key={category} className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <h3 className="font-semibold">{category}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                    {category === "News" && "समाचार"}
                    {category === "Sports" && "खेल"}
                    {category === "Entertainment" && "मनोरंजन"}
                    {category === "Politics" && "राजनीति"}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}