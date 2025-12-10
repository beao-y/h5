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
          <img :src="info.ImagesList && info.ImagesList.length > 0 ? info.ImagesList[0] : '@/assets/img/home1.png'" alt="项目图片" class="poster-img" />
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
      // 使用 $nextTick 确保 DOM 已渲染，元素已存在
      this.$nextTick(() => {
        // 确保元素存在
        const qrcodeEl = document.getElementById('qrcode');
        if (!qrcodeEl) return;
        
        // 清空容器
        qrcodeEl.innerHTML = '';
        
        // 获取详情id，从路由参数中获取
        const id = this.$route.params.id; // 默认id为1
        
        // 生成带id的URL
        const url = `${window.location.origin}${this.$route.path}?id=${id}`;
        
        console.log(url,999);
        
        // 生成二维码
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
        duration: 0, // 不自动关闭
        forbidClick: true // 禁止点击
      });

      // 预处理图片，确保 object-fit: cover 生效
      this.preprocessImages().then(() => {
        // 获取海报容器元素
        const posterContainer = document.querySelector('.poster-container');
        if (!posterContainer) {
          this.$toast.fail('保存失败');
          return;
        }

        // 使用 html2canvas 将 DOM 转换为 canvas
        import('html2canvas').then((html2canvas) => {
          // 简化html2canvas配置，确保所有元素都能正确显示
          html2canvas.default(posterContainer, {
            useCORS: true, // 允许跨域图片
            scale: 2, // 提高图片质量
            backgroundColor: '#ffffff', // 设置背景色
            logging: false, // 关闭日志
            allowTaint: true, // 允许跨域图片污染画布
            useTransform: true, // 使用CSS变换
            // 确保所有元素都能正确显示
            ignoreElements: (element) => {
              // 只忽略display: none的元素，不忽略visibility: hidden的元素
              return element.style.display === 'none';
            },
            // 确保二维码已生成
            timeout: 5000, // 增加超时时间
            // 确保图片加载完成
            onclone: (clonedDoc) => {
              // 确保所有图片都已加载
              const images = clonedDoc.querySelectorAll('img');
              images.forEach(img => {
                img.crossOrigin = 'anonymous';
              });
            }
          }).then((canvas) => {
            // 检测是否是微信浏览器
            const isWechat = /MicroMessenger/i.test(navigator.userAgent);
            
            if (isWechat) {
              // 微信浏览器：使用JSSDK保存到相册
              this.saveImageWithWechatJSSDK(canvas);
            } else {
              // 其他浏览器：直接下载图片
              this.downloadImageDirectly(canvas);
            }
          }).catch((error) => {
            console.error('生成图片失败:', error);
            this.$toast.fail('保存失败');
            // 恢复原图
            this.restoreImages();
          });
        }).catch((error) => {
          console.error('加载 html2canvas 失败:', error);
          this.$toast.fail('保存失败');
          // 恢复原图
          this.restoreImages();
        });
      });
    },
    
    // 微信浏览器使用JSSDK保存到相册
    saveImageWithWechatJSSDK(canvas) {
      try {
        // 转换为DataURL
        const dataURL = canvas.toDataURL('image/png');
        
        // 恢复原图
        this.restoreImages();
        
        // 检查微信JSSDK是否已加载
        if (window.wx && window.wx.saveImageToPhotosAlbum) {
          // 使用微信JSSDK保存到相册
          window.wx.saveImageToPhotosAlbum({
            filePath: dataURL,
            success: () => {
              this.$toast.success({
                message: '图片已保存到相册',
                duration: 1500,
                onClose: () => {
                  // 关闭弹窗
                  this.visible = false;
                }
              });
            },
            fail: (err) => {
              console.error('微信JSSDK保存失败:', err);
              // 如果是用户拒绝授权，提示用户
              if (err.errMsg.indexOf('auth deny') > -1) {
                this.$toast.fail('请先授权保存到相册');
              } else {
                this.$toast.fail('保存失败');
              }
              // 关闭弹窗
              this.visible = false;
            }
          });
        } else {
          // 微信JSSDK未加载，直接下载图片
          this.downloadImageDirectly(canvas);
        }
      } catch (err) {
        console.error('微信JSSDK保存异常:', err);
        // 异常情况下直接下载
        this.downloadImageDirectly(canvas);
      }
    },
    
    // 直接下载图片（非微信浏览器）
    downloadImageDirectly(canvas) {
      try {
        // 转换为DataURL
        const dataURL = canvas.toDataURL('image/png');
        
        // 创建下载链接
        const link = document.createElement('a');
        link.href = dataURL;
        link.download = `项目详情_${new Date().getTime()}.png`;
        
        // 在移动端触发下载
        link.style.display = 'none';
        document.body.appendChild(link);
        
        // 使用触摸事件模拟点击，提高移动端兼容性
        const event = new MouseEvent('click', {
          bubbles: true,
          cancelable: true,
          view: window
        });
        link.dispatchEvent(event);
        
        // 清理
        setTimeout(() => {
          document.body.removeChild(link);
        }, 100);
        
        // 恢复原图
        this.restoreImages();
        
        // 保存成功提示
        this.$toast.success({
          message: '图片已下载',
          duration: 1500,
          onClose: () => {
            // 关闭弹窗
            this.visible = false;
          }
        });
      } catch (err) {
        console.error('直接下载失败:', err);
        this.$toast.fail('保存失败');
        // 恢复原图
        this.restoreImages();
        // 关闭弹窗
        this.visible = false;
      }
    },
    // 预处理图片，确保 object-fit: cover 生效
    preprocessImages() {
      return new Promise((resolve) => {
        // 获取所有需要处理的图片
        const images = document.querySelectorAll('.poster-img');
        this.originalImages = [];

        // 如果没有图片，直接返回
        if (images.length === 0) {
          resolve();
          return;
        }

        let processed = 0;

        images.forEach((img, index) => {
          // 保存原图信息
          this.originalImages[index] = {
            src: img.src,
            style: {
              objectFit: img.style.objectFit,
              width: img.style.width,
              height: img.style.height
            }
          };

          // 创建 canvas 处理 object-fit: cover 效果
          const wrapper = img.parentElement;
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          const imgElement = new Image();
          imgElement.crossOrigin = 'anonymous';
          imgElement.src = img.src;

          imgElement.onload = () => {
            // 设置 canvas 大小与容器相同
            canvas.width = wrapper.offsetWidth;
            canvas.height = wrapper.offsetHeight;

            // 计算图片绘制的位置和大小，实现 cover 效果
            const containerRatio = wrapper.offsetWidth / wrapper.offsetHeight;
            const imageRatio = imgElement.width / imgElement.height;
            let drawWidth, drawHeight, offsetX, offsetY;

            if (imageRatio > containerRatio) {
              drawHeight = canvas.height;
              drawWidth = drawHeight * imageRatio;
              offsetX = (canvas.width - drawWidth) / 2;
              offsetY = 0;
            } else {
              drawWidth = canvas.width;
              drawHeight = drawWidth / imageRatio;
              offsetX = 0;
              offsetY = (canvas.height - drawHeight) / 2;
            }

            // 绘制图片到 canvas
            ctx.drawImage(imgElement, offsetX, offsetY, drawWidth, drawHeight);

            // 用 canvas 替换原图
            img.src = canvas.toDataURL('image/png');
            img.style.objectFit = 'fill';
            img.style.width = '100%';
            img.style.height = '100%';

            processed++;
            if (processed === images.length) {
              resolve();
            }
          };

          imgElement.onerror = () => {
            processed++;
            if (processed === images.length) {
              resolve();
            }
          };
        });
      });
    },
    // 恢复原图
    restoreImages() {
      if (!this.originalImages) return;

      const images = document.querySelectorAll('.poster-img');
      images.forEach((img, index) => {
        const original = this.originalImages[index];
        if (original) {
          img.src = original.src;
          img.style.objectFit = original.style.objectFit;
          img.style.width = original.style.width;
          img.style.height = original.style.height;
        }
      });
      this.originalImages = null;
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
  height: 180px;
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
