<template>
  <div class="page">
    <!-- 页面标题 -->
    <div class="page-header" v-if="Object.keys(info).length !== 0">
      <h1 class="project-title">{{info.ProjectName}}</h1>
      <p class="project-subtitle">{{info.MainSlogan}}</p>
      <p class="project-welcome">{{info.SubSlogan}}❤️<van-icon name="heart" color="#e64340" size="16" /></p>
      <div class="project-tags">{{info.Tags}}</div>
      <p class="project-description">{{info.IntroContent}}🎉🎉<van-icon name="emoticon" color="#e64340" size="16" /></p>
    </div>

    <!-- 信息卡片 -->
    <div class="info-cards" v-if="Object.keys(info).length !== 0">
      <!-- 精装办公租赁 -->
      <div class="info-card">
        <div class="card-title">精装办公租赁</div>
        <div class="card-value">
          <span class="value-number">{{info.OfficeRentPrice}}</span>
          <!-- <span class="value-unit">元/㎡/天</span> -->
        </div>
      </div>

      <!-- 面积组合 -->
      <div class="info-card">
        <div class="card-title">面积组合</div>
        <div class="card-value">
          <span class="value-number">{{info.AreaRange}}</span>
          <!-- <span class="value-unit">平米</span> -->
        </div>
      </div>

      <!-- 共享办公 -->
      <div class="info-card">
        <div class="card-title">共享办公</div>
        <div class="card-value">
          <span class="value-number">{{info.SharedOfficePrice}}</span>
          <!-- <span class="value-unit">元/月/工位</span> -->
        </div>
      </div>

      <!-- 招商热线 -->
      <div class="info-card">
        <div class="card-title">招商热线</div>
        <div class="card-value">{{info.InvestmentHotline}}</div>
      </div>
    </div>

    <!-- 视频区域 -->
    <div class="video-section">
      <!-- 动态生成视频和图片 -->
      <div class="video-item" v-for="(item, index) in videos" :key="index">
        <div class="video-wrapper">
          <!-- 显示视频封面或图片 -->
          <template v-if="item.isVideo">
            <!-- 视频：显示第一帧封面和播放按钮 -->
            <img
              :src="item.cover"
              alt="视频封面"
              class="video-cover"
            />
            <div class="video-play-btn" @click="playVideo(index)">
              <van-icon name="play-circle-o" size="40" color="#fff" />
            </div>
          </template>
          <template v-else>
            <!-- 图片：直接显示 -->
            <img
              :src="item.url"
              alt="图片内容"
              class="video-cover"
            />
          </template>
        </div>
      </div>
    </div>

    <!-- 视频播放器 -->
    <van-popup v-model="showVideo" position="center" round :close-on-click-overlay="true">
      <div class="video-player-container">
        <video
          ref="videoPlayer"
          :src="currentVideo.url"
          controls
          autoplay
          playsinline
          class="native-video"
        ></video>
      </div>
    </van-popup>
  </div>
</template>

<script>
import axios from 'axios';
export default {
  data() {
    return {
      // 视频数据
      videos: [
      ],
      showVideo: false,
      info:{},
      currentVideo: {
        url: ''
      }
    }
  },
  mounted() {
    this.getProfileInfo();
    this.getVideoList();
  },
  watch: {
    // 监听视频弹窗关闭事件，关闭时暂停视频播放
    showVideo(newVal, oldVal) {
      if (oldVal && !newVal) {
        // 弹窗关闭时暂停视频
        const video = this.$refs.videoPlayer;
        if (video) {
          video.pause();
        }
      }
    }
  },
  methods: {
    getProfileInfo() {
      axios.post(`${process.env.VUE_APP_BASE_API}/system/projectintro/index`,null, {
        params: {
          pageIndex:1,
          pageSize:10,
        }
      }).then((response) => {
        const data = response.data || {};
        
        this.info = data.list[0] || {};
      })
    },
    getVideoList() {
      axios.post(`${process.env.VUE_APP_BASE_API}/system/projectintromedia/index`,null, {
        params: {
          pageIndex:1,
          pageSize:10,
        }
      }).then((response) => {
        const data = response.data || {};
        console.log(data.list,444);
        
        // 处理数据，区分图片和视频
        const videos = data.list.map(item => {
          const url = `${process.env.VUE_APP_BASE_API}${item.MediaUrl}`;
          // 根据文件扩展名判断是图片还是视频
          const isVideo = url.toLowerCase().endsWith('.mp4') || url.toLowerCase().endsWith('.avi') || url.toLowerCase().endsWith('.mov') || url.toLowerCase().endsWith('.webm');
          return {
            url,
            isVideo,
            cover: isVideo ? '' : url // 图片直接使用url作为封面，视频初始封面为空
          };
        });
        
        this.videos = videos;
        
        // 为视频生成第一帧作为封面
        this.generateVideoCovers();
      })
    },
    // 生成视频第一帧作为封面
    generateVideoCovers() {
      this.videos.forEach((video, index) => {
        if (video.isVideo) {
          // 创建video元素用于生成第一帧
          const videoEl = document.createElement('video');
          videoEl.preload = 'metadata';
          videoEl.crossOrigin = 'anonymous';
          videoEl.src = video.url;
          
          videoEl.addEventListener('loadedmetadata', () => {
            // 视频加载元数据后，设置.currentTime = 0.1，然后获取第一帧
            videoEl.currentTime = 0.1;
            
            videoEl.addEventListener('seeked', () => {
              // 创建canvas元素
              const canvas = document.createElement('canvas');
              canvas.width = videoEl.videoWidth;
              canvas.height = videoEl.videoHeight;
              
              // 绘制第一帧到canvas
              const ctx = canvas.getContext('2d');
              ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
              
              // 将canvas转换为base64图片
              const cover = canvas.toDataURL('image/png');
              
              // 更新视频封面
              this.videos[index].cover = cover;
              
              // 清理资源
              videoEl.remove();
              canvas.remove();
            });
          });
          
          videoEl.addEventListener('error', () => {
            console.error('视频加载失败:', video.url);
            // 加载失败时使用默认封面
            video.cover = '';
            videoEl.remove();
          });
        }
      });
    },
    // 播放视频
    playVideo(index) {
      this.currentVideo = this.videos[index];
      this.showVideo = true;
    }
  }
}
</script>

<style scoped>
/* 页面样式 */
.page {
  padding: 46px 12px 60px ;
  background: linear-gradient(180deg, #EADCC1 0%, #FFF7E8 100%);
  height: 100vh;
  overflow-y: auto;
  box-sizing: border-box;
}

/* 页面头部样式 */
.page-header {
  text-align: center;
  padding: 20px 20px 10px;
}

.project-title {
  font-size: 24px;
  font-weight: bold;
  color: #191B2A;
  margin-bottom: 10px;
}

.project-subtitle {
  font-size: 16px;
  color: #908B83;
  margin-bottom: 10px;
}

.project-welcome {
  font-size: 14px;
  color: #908B83;
  margin-bottom: 10px;
}

.project-tags {
  font-size: 16px;
  color: #9E8A65;
  font-weight: bold;
  margin-bottom: 10px;
}

.project-description {
  font-size: 14px;
  color: #908B83;
}

/* 信息卡片样式 */
.info-cards {
  margin: 10px 0;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.info-card {
  background-color: #fff;
  border-radius: 8px;
  padding: 10px;
  text-align: left;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.card-title {
  font-size: 14px;
  color: #777986;
  margin-bottom: 10px;
}

.card-value {
  font-size: 18px;
  color: #191B2A;
  font-weight: bold;
  display: flex;
  align-items: baseline;
  justify-content: flex-start;
}

.value-number {
  font-size: 18px;
  font-weight: bold;
  color: #191B2A;
}

.value-unit {
  font-size: 14px;
  color: #908B83;
  margin-left: 5px;
  font-weight: normal;
}

/* 视频区域样式 */
.video-section {
  margin: 20px 0;
}

.video-item {
  margin-bottom: 15px;
  position: relative;
  border-radius: 8px;
  overflow: hidden;
}

.video-wrapper {
  position: relative;
}

.video-cover {
  width: 100%;
  height: 260px;
  display: block;
}

.video-play-btn {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  padding: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 视频播放器样式 */
.van-popup {
  width: 80%;
  max-width: 800px;
  height: auto;
  max-height: 80vh;
  padding: 0;
  margin: 0;
  overflow: hidden;
  background-color: #000;
}

.video-player-container {
  width: 100%;
  height: 0;
  padding-bottom: 56.25%; /* 16:9 宽高比 */
  position: relative;
  overflow: hidden;
  background-color: #000;
}

.native-video {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: block;
  object-fit: contain;
  background-color: #000;
}

/* 禁止弹窗内滚动 */
.van-popup__content {
  overflow: hidden;
  background-color: transparent;
}
</style>