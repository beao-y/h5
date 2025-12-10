<template>
  <!-- 分享弹窗 -->
  <div class="popup-wrapper">
    <van-popup
      v-model="visible"
      position="center"
      :close-on-click-overlay="true"
      round
      class="share-popup"
      @click-overlay="onClose"
    >
      <!-- 关闭图标 -->
      <div class="popup-close" @click="onClose">
        <van-icon name="cross" size="18" color="#666" />
      </div>
      <div class="poster-container">
        
        <!-- 项目图片 -->
        <div class="poster-img-wrapper">
          <img :src="info.ImagesList && info.ImagesList.length > 0 ? info.ImagesList[0] : ''" alt="项目图片" class="poster-img" />
        </div>
        
        <!-- 价格信息 -->
        <div class="poster-price">
          <span class="price-label">约</span>
          <span class="price-number">{{ info.Price}}</span>
          <span class="price-unit">元/㎡</span>

        </div>
        
        <!-- 项目名称 -->
        <h2 class="project-name">{{ info.ProjectName }}</h2>
        
        <!-- 项目标签 -->
        <div class="project-tags">
          <span class="tag">{{info.PreSalePermit}}</span>
          <span class="tags-container">
            <span v-for="(tag, tagIndex) in info.Tags" :key="tagIndex">
              <span class="tag-text">{{ tag }}</span>
              <span class="tag-slash" v-if="tagIndex < info.Tags.length - 1">/</span>
            </span>
          </span>
        </div>
        
        <!-- 项目基本信息 -->
        <div class="info-section">
          <div class="info-item">
            <div class="info-label">{{ info.BuildingCategory }}</div>
            <div class="info-value">类型</div>
          </div>
          <div class="info-item">
            <div class="info-label">{{ info.AreaSegment }}</div>
            <div class="info-value">面积段</div>
          </div>
          <div class="info-item">
            <div class="info-label">{{ info.FloorHeight }}</div>
            <div class="info-value">层高</div>
          </div>
        </div>
        
        <!-- 二维码部分 -->
        <div class="qrcode-section">
          <img src="@/assets/img/logo.png" alt="二维码" class="qrcode-logo" />
          <div class="qrcode-content">
            <p class="qrcode-tip">长按识别二维码了解更多</p>
          <div id="qrcode" class="qrcode-img"></div>
          </div>
          
          
        </div>
      </div>
    </van-popup>
    
    <!-- 悬浮保存图片按钮 -->
    <div class="save-button" v-if="visible">
      <van-button type="primary" block @click="saveImage" native-type="button">保存图片</van-button>
    </div>
  </div>
</template>

<script>
import QRCode from 'qrcodejs2';

export default {
  name: 'SharePop',
  props: {
    showSharePopup: {
      type: Boolean,
      default: false
    },
    info: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      // 本地状态，用于控制弹窗显示
      visible: this.showSharePopup,
      // 二维码实例
      qrCode: null
    };
  },
  watch: {
    // 监听 prop 变化，更新本地状态
    showSharePopup(newVal) {
      this.visible = newVal;
    },
    // 监听本地状态变化，通知父组件
    visible(newVal) {
      console.log(newVal);
      
      this.$emit('update:showSharePopup', newVal);
      // 当弹窗显示时，重新生成二维码
      if (newVal) {
        this.generateQRCode();
      }
    }
  },
  mounted() {
    // 组件挂载后生成二维码
    if (this.visible) {
      this.generateQRCode();
    }
  },
  beforeUnmount() {
    // 组件卸载前销毁二维码实例
    if (this.qrCode) {
      this.qrCode.clear();
      this.qrCode = null;
    }
  },
  methods: {
    // 生成二维码
    generateQRCode() {
      this.$nextTick(() => {
        const qrcodeEl = document.getElementById('qrcode');
        if (!qrcodeEl) return;
        
        qrcodeEl.innerHTML = '';
        const id = this.$route.params.id;
        const url = `${window.location.origin}${this.$route.path}?id=${id}`;
        
        this.qrCode = new QRCode(qrcodeEl, {
          text: url,
          width: 60,
          height: 60,
          colorDark: '#000000',
          colorLight: '#ffffff',
          correctLevel: QRCode.CorrectLevel.H
        });
      });
    },
    
    // 保存图片（微信浏览器使用JSSDK，其他浏览器直接下载）
    saveImage() {
      this.$toast.loading({
        message: '保存中...',
        duration: 0,
        forbidClick: true
      });

      const posterContainer = document.querySelector('.poster-container');
      if (!posterContainer) {
        this.$toast.fail('保存失败');
        return;
      }

      // 使用html-to-image保存图片（替代html2canvas）
      import('html-to-image').then((htmlToImage) => {
        // 先处理所有图片，确保跨域属性设置正确
        const images = posterContainer.querySelectorAll('img');
        images.forEach(img => {
          img.crossOrigin = 'anonymous';
        });
        
        // 使用html-to-image的toPng方法，更好的跨域支持
        htmlToImage.toPng(posterContainer, {
          pixelRatio: 2,
          backgroundColor: '#ffffff',
          crossorigin: 'anonymous'
        }).then((dataUrl) => {
          const isWechat = /MicroMessenger/i.test(navigator.userAgent);
          
          if (isWechat && window.wx && window.wx.saveImageToPhotosAlbum) {
            // 微信浏览器使用JSSDK保存到相册
            window.wx.saveImageToPhotosAlbum({
              filePath: dataUrl,
              success: () => {
                this.$toast.success({
                  message: '图片已保存到相册',
                  duration: 1500,
                  onClose: () => this.visible = false
                });
              },
              fail: () => {
                this.$toast.fail('保存失败');
                this.visible = false;
              }
            });
          } else {
            // 其他浏览器直接下载
            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = `项目详情_${new Date().getTime()}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            this.$toast.success({
              message: '图片已下载',
              duration: 1500,
              onClose: () => this.visible = false
            });
          }
        }).catch(() => {
          this.$toast.fail('保存失败');
        });
      }).catch(() => {
        this.$toast.fail('保存失败');
      });
    },
    
    // 关闭弹窗
    onClose() {
      this.visible = false;
    }
  }
}
</script>

<style scoped>
/* 弹窗容器 */
.popup-wrapper {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 分享弹窗样式 */
.share-popup {
  width: 340px;
  max-height: 80vh;
  overflow-y: auto;
  padding: 10px;
  box-sizing: border-box;
}

.poster-container {
  background-color: #fff;
  border-radius: 10px;
  position: relative;
}

/* 关闭图标样式 */
.popup-close {
  position: absolute;
  top: 10px;
  right: 10px;
  cursor: pointer;
  z-index: 10;
  background-color: #fff;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}



/* 项目标题 */
.poster-title {
  font-size: 20px;
  font-weight: bold;
  color: #B6A37E;
  margin-bottom: 5px;
  text-align: center;
}

.poster-subtitle {
  font-size: 12px;
  color: #999;
  margin-bottom: 15px;
  text-align: center;
}

/* 项目图片容器 */
.poster-img-wrapper {
  width: 100%;
  aspect-ratio: 4 / 3;
  overflow: hidden;
  border-radius: 8px;
  margin-bottom: 15px;
}

/* 项目图片 */
.poster-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
}

/* 价格信息 */
.poster-price {
  font-size: 18px;
  color: #e64340;
  margin-bottom: 10px;
  text-align: center;
}

.price-label {
  font-size: 14px;
  color: #e64340;
}

.price-number {
  font-size: 24px;
  font-weight: bold;
  color: #e64340;
  margin: 0 4px;
}

.price-unit {
  font-size: 14px;
  color: #e64340;
}

/* 项目名称 */
.project-name {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 10px;
  text-align: center;
  padding: 0 10px;
}

/* 项目标签 */
.project-tags {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 15px;
  flex-wrap: wrap;
  padding: 0 10px;
}

.project-tags .tag {
  background-color: #F3EDE2;
  color: #95886F;
  padding: 3px 8px;
  border-radius: 10px;
  font-size: 12px;
  margin-right: 8px;
  margin-bottom: 8px;
}

.project-tags .tags-container {
  display: flex;
  align-items: center;
  margin-bottom: 9px;
}

.project-tags .tag-text {
  font-size: 12px;
  color: #95886F;
}

.project-tags .tag-slash {
  font-size: 12px;

  color: #95886F;
  margin: 0 4px;
}

/* 项目基本信息 */
.info-section {
  display: flex;
  justify-content: space-around;
  margin-bottom: 20px;
  padding: 10px;
  border-top: 1px solid #f0f0f0;
  border-bottom: 1px solid #f0f0f0;
}

.info-item {
  text-align: center;
  flex: 1;
}

.info-label {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 5px;
}

.info-value {
  font-size: 12px;
  color: #999;
}

/* 二维码部分 */
.qrcode-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 10px;
}

.qrcode-logo {
  width: 110px;
  height: auto;
  object-fit: contain;
  margin-bottom: 10px;
}

.qrcode-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.qrcode-img {
  width: 60px;
  height: 60px;
  object-fit: contain;
  margin-bottom: 10px;
}

.qrcode-tip {
  flex: 0 0  80px;
  text-align: right;
  font-size: 12px;
  color: #999;
  text-align: center;
}

/* 悬浮保存图片按钮 */
.save-button {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  width: 260px;
  z-index: 10000;
}

.save-button :deep(.van-button) {
  background-color: #EFE6D4;
  color: #9E875A;
  border-radius: 8px;
  border: none;
  width: 100%;
}

.save-button :deep(.van-button--primary) {
  background-color: #EFE6D4;
}

.save-button :deep(.van-button--primary::after) {
  border: none;
}
</style>
