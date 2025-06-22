import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import BreakingNewsTicker from "@/components/BreakingNewsTicker";
import LeftSidebar from "@/components/LeftSidebar";
import RightSidebar from "@/components/RightSidebar";
import { LAYOUT_CONFIG } from "@/lib/constants";
import { Play, Users, Signal, X, Volume2, VolumeX, Maximize, Minimize } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { LiveStream } from "@shared/schema";

export default function LiveTVPage() {
  const [selectedStream, setSelectedStream] = useState<LiveStream | null>(null);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const { data: streams = [], isLoading } = useQuery<LiveStream[]>({
    queryKey: ["/api/live-streams"],
  });

  const activeStreams = streams.filter(stream => stream.isActive);

  const handleStreamClick = (stream: LiveStream) => {
    setSelectedStream(stream);
    setIsPlayerOpen(true);
  };

  const closePlayer = () => {
    setIsPlayerOpen(false);
    setSelectedStream(null);
    setIsFullscreen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-hindi">
      <Header />
      <BreakingNewsTicker />
      
      <div className="mx-auto px-4 py-6" style={{ maxWidth: LAYOUT_CONFIG.header.maxWidth }}>
        <div className="flex gap-6">
          <LeftSidebar />
          
          <main className="flex-1" style={{ maxWidth: LAYOUT_CONFIG.content.main.width }}>
            {/* Page Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2 font-hindi">
                लाइव टीवी
              </h1>
              <p className="text-gray-600 font-hindi">
                समाचार चैनलों की लाइव स्ट्रीमिंग देखें
              </p>
            </div>

            {/* Live Streams Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden animate-pulse">
                    <div className="aspect-video bg-gray-200"></div>
                    <div className="p-4">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : activeStreams.length === 0 ? (
              <div className="text-center py-12">
                <Signal className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-gray-900 mb-2 font-hindi">
                  कोई लाइव स्ट्रीम उपलब्ध नहीं है
                </h2>
                <p className="text-gray-600 font-hindi">
                  फिलहाल कोई लाइव टीवी चैनल प्रसारित नहीं हो रहा है।
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeStreams.map((stream) => (
                  <div key={stream.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                    {/* Stream Thumbnail/Player */}
                    <div 
                      className="aspect-video bg-black relative group cursor-pointer"
                      onClick={() => handleStreamClick(stream)}
                    >
                      {stream.thumbnailUrl ? (
                        <img 
                          src={stream.thumbnailUrl} 
                          alt={stream.nameHindi}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-600 to-red-800">
                          <Play className="w-16 h-16 text-white" />
                        </div>
                      )}
                      
                      {/* Live Indicator */}
                      <div className="absolute top-4 left-4">
                        <span className="bg-red-600 text-white text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1 animate-pulse">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                          LIVE
                        </span>
                      </div>
                      
                      {/* Play Button Overlay */}
                      <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm">
                          <Play className="w-8 h-8 text-white ml-1" />
                        </div>
                      </div>
                      
                      {/* Viewer Count */}
                      <div className="absolute bottom-4 right-4">
                        <span className="bg-black bg-opacity-50 text-white text-sm px-2 py-1 rounded flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {stream.viewerCount || 0}
                        </span>
                      </div>
                    </div>
                    
                    {/* Stream Info */}
                    <div className="p-4">
                      <h3 className="font-bold text-lg text-gray-900 mb-1 font-hindi">
                        {stream.nameHindi}
                      </h3>
                      <p className="text-gray-600 text-sm font-hindi mb-2">
                        {stream.name}
                      </p>
                      {stream.description && (
                        <p className="text-gray-500 text-sm font-hindi line-clamp-2">
                          {stream.description}
                        </p>
                      )}
                      
                      {/* Category Badge */}
                      <div className="mt-3">
                        <span className="inline-block bg-gray-100 text-gray-700 text-xs font-semibold px-2 py-1 rounded font-hindi">
                          {stream.category}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
          </main>
          
          <RightSidebar />
        </div>
      </div>

      {/* Video Player Modal */}
      <Dialog open={isPlayerOpen} onOpenChange={setIsPlayerOpen}>
        <DialogContent className={`${isFullscreen ? 'max-w-screen max-h-screen w-screen h-screen' : 'max-w-4xl'} p-0 bg-black`}>
          <DialogTitle className="sr-only">
            {selectedStream ? `${selectedStream.nameHindi} Live Stream` : 'Live Stream Player'}
          </DialogTitle>
          {selectedStream && (
            <div className="relative w-full h-full">
              {/* Video Player */}
              <div className="w-full h-full bg-black flex items-center justify-center">
                {selectedStream.url ? (
                  <div className="w-full h-full relative">
                    {/* YouTube Embed for demonstrable streaming */}
                    {selectedStream.name.includes('CNN') ? (
                      <iframe
                        src="https://www.youtube.com/embed/live_stream?channel=UCupvZG-5ko_eiXAupbDfxWw&autoplay=1"
                        className="w-full h-full"
                        allowFullScreen
                        title={`${selectedStream.nameHindi} Live Stream`}
                        allow="autoplay; encrypted-media"
                      />
                    ) : selectedStream.name.includes('Al Jazeera') ? (
                      <iframe
                        src="https://www.youtube.com/embed/live_stream?channel=UCNye-wNBqNL5ZzHSJj3l8Bg&autoplay=1"
                        className="w-full h-full"
                        allowFullScreen
                        title={`${selectedStream.nameHindi} Live Stream`}
                        allow="autoplay; encrypted-media"
                      />
                    ) : selectedStream.name.includes('France') ? (
                      <iframe
                        src="https://www.youtube.com/embed/live_stream?channel=UCQfwfsi5VrQ8yKZ-UWmAEFg&autoplay=1"
                        className="w-full h-full"
                        allowFullScreen
                        title={`${selectedStream.nameHindi} Live Stream`}
                        allow="autoplay; encrypted-media"
                      />
                    ) : (
                      /* Direct video stream fallback */
                      <video
                        src={selectedStream.url}
                        controls
                        autoPlay
                        muted={isMuted}
                        className="w-full h-full"
                        crossOrigin="anonymous"
                        onError={(e) => {
                          console.error("Failed to load video stream:", e);
                        }}
                        onLoadStart={() => {
                          console.log("Loading stream:", selectedStream.url);
                        }}
                      />
                    )}
                  </div>
                ) : (
                  <div className="text-center text-white p-8">
                    <Play className="w-16 h-16 mx-auto mb-4 text-red-600" />
                    <h3 className="text-xl font-bold mb-2">{selectedStream.nameHindi}</h3>
                    <p className="text-gray-300">Stream URL not available</p>
                    <p className="text-sm text-gray-400 mt-2">
                      Contact admin to configure stream URL for this channel
                    </p>
                  </div>
                )}
              </div>

              {/* Player Controls Overlay */}
              <div className="absolute top-4 right-4 flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-black/50 border-white/20 text-white hover:bg-black/70"
                  onClick={() => setIsMuted(!isMuted)}
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-black/50 border-white/20 text-white hover:bg-black/70"
                  onClick={() => setIsFullscreen(!isFullscreen)}
                >
                  {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-black/50 border-white/20 text-white hover:bg-black/70"
                  onClick={closePlayer}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Stream Info Overlay */}
              <div className="absolute bottom-4 left-4 text-white">
                <div className="bg-black/50 backdrop-blur-sm rounded-lg p-3">
                  <h3 className="font-bold text-lg">{selectedStream.nameHindi}</h3>
                  <p className="text-sm text-gray-300">{selectedStream.name}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm">
                    <span className="bg-red-600 text-white px-2 py-1 rounded-full flex items-center gap-1">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      LIVE
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {selectedStream.viewerCount || 0} viewers
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}