import { Feather } from "@expo/vector-icons";
import { useVideoPlayer, VideoView } from "expo-video";
import React, { useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";

interface VideoPlayerProps {
  videoUrl: string;
  initialTime?: number;
  onProgressUpdate?: (currentTime: number, duration: number) => void;
  onComplete?: () => void;
}

export function VideoPlayer({ videoUrl, initialTime = 0, onProgressUpdate, onComplete }: VideoPlayerProps) {
  const colors = useColors();
  const [showControls, setShowControls] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const hasEmittedComplete = useRef(false);
  const lastSaveTime = useRef(0);

  const player = useVideoPlayer(videoUrl, (player) => {
    player.loop = false;
    if (initialTime > 0) {
      player.currentTime = initialTime;
    }
    player.play();
  });

  useEffect(() => {
    if (!player) return;

    const playingInterval = setInterval(() => {
      setIsPlaying(player.playing);
      setCurrentTime(player.currentTime);
      setDuration(player.duration);

      // Save progress every 5 seconds
      const now = Date.now();
      if (player.playing && now - lastSaveTime.current >= 5000) {
        onProgressUpdate?.(player.currentTime, player.duration);
        lastSaveTime.current = now;
      }

      // Check completion threshold (90%)
      const percentage = (player.currentTime / player.duration) * 100;
      if (percentage >= 90 && !hasEmittedComplete.current) {
        onComplete?.();
        hasEmittedComplete.current = true;
      }
    }, 100);

    return () => {
      clearInterval(playingInterval);
    };
  }, [player, onProgressUpdate, onComplete]);

  // Auto-hide controls after 3 seconds
  useEffect(() => {
    if (showControls && isPlaying) {
      const timeout = setTimeout(() => setShowControls(false), 3000);
      return () => clearTimeout(timeout);
    }
  }, [showControls, isPlaying]);

  const togglePlayPause = () => {
    if (isPlaying) {
      player.pause();
    } else {
      player.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    // Note: Full native fullscreen requires platform-specific implementation
    // This is a placeholder for the UI state
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <View style={styles.container}>
      <Pressable
        style={styles.videoContainer}
        onPress={() => setShowControls(!showControls)}
      >
        <VideoView
          player={player}
          style={styles.video}
          nativeControls={false}
          allowsFullscreen={false}
          allowsPictureInPicture={false}
        />

        {/* Controls Overlay */}
        {showControls && (
          <View style={styles.controlsOverlay}>
            {/* Top Bar */}
            <View style={[styles.topBar, { backgroundColor: "rgba(0,0,0,0.6)" }]}>
              <Pressable onPress={toggleFullscreen} style={styles.iconButton}>
                <Feather
                  name={isFullscreen ? "minimize" : "maximize"}
                  size={20}
                  color="#FFF"
                />
              </Pressable>
            </View>

            {/* Center Play Button */}
            <View style={styles.centerControls}>
              <Pressable
                onPress={togglePlayPause}
                style={[styles.playButton, { backgroundColor: "rgba(0,0,0,0.6)" }]}
              >
                <Feather name={isPlaying ? "pause" : "play"} size={40} color="#FFF" />
              </Pressable>
            </View>

            {/* Bottom Bar */}
            <View style={[styles.bottomBar, { backgroundColor: "rgba(0,0,0,0.6)" }]}>
              {/* Time Display */}
              <View style={styles.timeRow}>
                <Text style={styles.timeText}>
                  {formatTime(currentTime)} / {formatTime(duration)}
                </Text>
                <Pressable onPress={togglePlayPause} style={styles.iconButton}>
                  <Feather name={isPlaying ? "pause" : "play"} size={24} color="#FFF" />
                </Pressable>
              </View>

              {/* Progress Bar */}
              <View style={styles.progressContainer}>
                <View style={styles.progressTrack}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${progressPercentage}%`, backgroundColor: colors.primary },
                    ]}
                  />
                </View>
              </View>
            </View>
          </View>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    aspectRatio: 16 / 9,
    backgroundColor: "#000",
    position: "relative",
  },
  videoContainer: {
    flex: 1,
    position: "relative",
  },
  video: {
    width: "100%",
    height: "100%",
  },
  controlsOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "space-between",
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "flex-end",
    padding: 12,
  },
  centerControls: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  bottomBar: {
    padding: 12,
    gap: 8,
  },
  timeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  timeText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "600",
  },
  progressContainer: {
    width: "100%",
  },
  progressTrack: {
    width: "100%",
    height: 4,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
  },
  iconButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
});
