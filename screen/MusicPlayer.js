import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  Image,
  FlatList,
  Animated,
} from 'react-native';
import TrackPlayer, {
  Capability,
  RepeatMode,
  Event,
  State,
  usePlaybackState,
  useProgress,
  useTrackPlayerEvents,
} from 'react-native-track-player';

import React, {useEffect, useRef, useState} from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Slider from '@react-native-community/slider';
import songs from '../model/Data';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const {width, height} = Dimensions.get('window');

const setupPlayer = async () => {
  try {
    await TrackPlayer.setupPlayer();
    await TrackPlayer.updateOptions({
      capabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SkipToNext,
        Capability.SkipToPrevious,
        Capability.Stop,
      ],
    });
    await TrackPlayer.add(songs);
  } catch (error) {
    console.log(error);
  }
};
const togglePlayBack = async playBackState => {
  const currentTrack = await TrackPlayer.getCurrentTrack();
  console.log(currentTrack, playBackState, State.Playing);
  if (currentTrack != null) {
    if (playBackState === State.Playing) {
      await TrackPlayer.pause();
    } else {
      await TrackPlayer.play();
    }
  }
};

const MusicPlayer = () => {
  const playBackState = usePlaybackState();
  const progress = useProgress();
  const [songIndex, setsongIndex] = useState(0);
  const [repeatMode, setRepeatMode] = useState('off');
  const [trackTitle, setTrackTitle] = useState();
  const [trackArtist, setTrackArtist] = useState();
  const [trackArtwork, setTrackArtwork] = useState();

  const scrollX = useRef(new Animated.Value(0)).current;
  const songSlider = useRef(null);

  useTrackPlayerEvents([Event.PlaybackTrackChanged], async event => {
    if (event.type === Event.PlaybackTrackChanged && event.nextTrack !== null) {
      const track = await TrackPlayer.getTrack(event.nextTrack);
      const {title, artwork, artist} = track;
      setTrackTitle(title);
      setTrackArtist(artist);
      setTrackArtwork(artwork);
    }
  });

  const repeatIcon = () => {
    if (repeatMode === 'off') {
      return 'repeat-off';
    }

    if (repeatMode === 'track') {
      return 'repeat-once';
    }

    if (repeatMode === 'repeat') {
      return 'repeat';
    }
  };

  const changeRepeatMode = () => {
    if (repeatMode === 'off') {
      TrackPlayer.setRepeatMode(RepeatMode.Track);
      setRepeatMode('track');
    }

    if (repeatMode === 'track') {
      TrackPlayer.setRepeatMode(RepeatMode.Queue);
      setRepeatMode('repeat');
    }

    if (repeatMode === 'repeat') {
      TrackPlayer.setRepeatMode(RepeatMode.Off);
      setRepeatMode('off');
    }
  };

  const skipTo = async trackId => {
    await TrackPlayer.skip(trackId);
  };

  useEffect(() => {
    setupPlayer();
    scrollX.addListener(({value}) => {
      const index = Math.round(value / width);
      skipTo(index);
      setsongIndex(index);
    });
    return () => {
      scrollX.removeAllListeners();
      TrackPlayer.destroy();
    };
  }, []);

  const skipToNext = () => {
    songSlider.current.scrollToOffset({
      offset: (songIndex + 1) * width,
    });
  };

  const skipToPrevious = () => {
    songSlider.current.scrollToOffset({
      offset: (songIndex - 1) * width,
    });
  };

  const renderSongs = ({item, index}) => {
    return (
      <Animated.View style={style.imagecover}>
        <View style={style.imagewrapper}>
          <Image source={trackArtwork} style={style.musicimage} />
        </View>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={style.container}>
      <View style={[style.fluid, style.elevation]}>
        {/* image */}

        <Animated.FlatList
          ref={songSlider}
          renderItem={renderSongs}
          data={songs}
          keyExtractor={item => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          scrollEventThrottle={16}
          onScroll={Animated.event(
            [
              {
                nativeEvent: {
                  contentOffset: {x: scrollX},
                },
              },
            ],
            {useNativeDriver: true},
          )}
        />

        {/* Song details */}

        <View>
          <Text style={style.title}>{trackTitle}</Text>
          <Text style={style.artist}>{trackArtist}</Text>
        </View>

        {/*sliderbar*/}

        <View>
          <Slider
            style={style.slider}
            value={progress.position}
            minimumValue={0}
            maximumValue={progress.duration}
            thumbTintColor="#FFD369"
            minimumTrackTintColor="#FFD369"
            maximumTrackTintColor="#fff"
            onSlidingComplete={async value => {
              await TrackPlayer.seekTo(value);
            }}
          />

          <View style={style.duration}>
            <Text style={style.durationtext}>
              {new Date(progress.position * 1000 - 30 * 60 * 1000)
                .toLocaleTimeString('it-IT')
                .substring(3)}
            </Text>
            <Text style={style.durationtext}>
              {new Date(
                (progress.duration - progress.position) * 1000 - 30 * 60 * 1000,
              )
                .toLocaleTimeString('it-IT')
                .substring(3)}
            </Text>
          </View>
        </View>

        {/* music controls */}
        <View style={style.musiccontrols}>
          <TouchableOpacity onPress={skipToPrevious}>
            <Ionicons
              name="play-skip-back-outline"
              size={35}
              color={'#FFD369'}
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => togglePlayBack(playBackState)}>
            <Ionicons
              name={
                playBackState === State.Playing
                  ? 'ios-pause-circle'
                  : 'ios-play-circle'
              }
              size={75}
              color="#FFD369"
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={skipToNext}>
            <Ionicons
              name="play-skip-forward-outline"
              size={35}
              color={'#FFD369'}
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={style.bottomcontainer}>
        <View style={style.iconwrapper}>
          <TouchableOpacity onPress={() => {}}>
            <Ionicons name="heart-outline" size={30} color={'#888888'} />
          </TouchableOpacity>

          <TouchableOpacity onPress={changeRepeatMode}>
            <MaterialCommunityIcons
              name={`${repeatIcon()}`}
              size={30}
              color={repeatMode !== 'off' ? '#FFD369' : '#888888'}
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => {}}>
            <Ionicons name="share-outline" size={30} color={'#888888'} />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => {}}>
            <Ionicons name="ellipsis-horizontal" size={30} color={'#888888'} />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default MusicPlayer;

const style = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#222831',
  },
  fluid: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomcontainer: {
    width: width,
    alignItems: 'center',
    paddingVertical: 15,
    borderTopColor: '#393E46',
    borderWidth: 1,
  },
  iconwrapper: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '80%',
  },
  imagewrapper: {
    width: 300,
    height: 340,
    marginBottom: 20,
    marginTop: 20,
  },
  musicimage: {
    width: '100%',
    height: '100%',
    borderRadius: 15,
  },
  elevation: {
    elevation: 5,
    shadowColor: '#ccc',
    shadowOffset: {
      width: 5,
      height: 5,
    },
    shadowOpacity: 0.5,
    shadowRadius: 3.84,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    color: '#EEEEEE',
  },
  artist: {
    fontSize: 16,
    fontWeight: '300',
    textAlign: 'center',
    color: '#EEEEEE',
  },
  slider: {
    width: 350,
    height: 40,
    marginTop: 20,
    flexDirection: 'row',
  },
  duration: {
    width: 340,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  durationtext: {
    color: '#fff',
    fontweight: '500',
  },
  musiccontrols: {
    width: '60%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  imagecover: {
    width: width,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
