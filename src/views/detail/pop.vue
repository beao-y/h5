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
      <div class="poster-container" ref="posterContainer">
        
        <!-- 项目图片 -->
        <div class="poster-img-wrapper">
          <img 
            :src="info.ImagesList && info.ImagesList.length > 0 ? info.ImagesList[0] : placeholderImage" 
            alt="项目图片" 
            class="poster-img"
            ref="mainImage"
            crossorigin="anonymous"
          />
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
          <img src="@/assets/img/logo.png" alt="二维码" class="qrcode-logo" crossorigin="anonymous" />
          <div class="qrcode-content">
            <p class="qrcode-tip">长按识别二维码了解更多</p>
            <div id="qrcode" class="qrcode-img"></div>
          </div>
        </div>
      </div>
    </van-popup>
    
    <!-- 悬浮保存图片按钮 -->
    <div class="save-button" v-if="visible">
      <van-button type="primary" block @click="saveWithCanvas" :loading="isSaving" native-type="button">
        {{ isSaving ? '生成中...' : '保存图片' }}
      </van-button>
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
      visible: this.showSharePopup,
      qrCode: null,
      isSaving: false,
      placeholderImage: this.createPlaceholderImage(),
      qrCodeDataUrl: null,
      logoDataUrl: null
    };
  },
  watch: {
    showSharePopup(newVal) {
      this.visible = newVal;
    },
    visible(newVal) {
      this.$emit('update:showSharePopup', newVal);
      if (newVal) {
        this.generateQRCode();
        this.preloadImages();
      }
    },
    'info.ImagesList': {
      handler() {
        if (this.visible) {
          this.preloadImages();
        }
      },
      immediate: true
    }
  },
  mounted() {
    if (this.visible) {
      this.generateQRCode();
      this.preloadImages();
    }
  },
  beforeUnmount() {
    if (this.qrCode) {
      this.qrCode.clear();
      this.qrCode = null;
    }
  },
  methods: {
    // 创建透明占位图
    createPlaceholderImage() {
      return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PC9zdmc+';
    },

    // 生成二维码
    generateQRCode() {
      this.$nextTick(() => {
        const qrcodeEl = document.getElementById('qrcode');
        if (!qrcodeEl) return;
        
        qrcodeEl.innerHTML = '';
        const id = this.$route.params.id;
        const url = `${window.location.origin}${this.$route.path}/${id}`;
        
        this.qrCode = new QRCode(qrcodeEl, {
          text: url,
          width: 60,
          height: 60,
          colorDark: '#000000',
          colorLight: '#ffffff',
          correctLevel: QRCode.CorrectLevel.H
        });
        
        // 获取二维码的data URL
        this.$nextTick(() => {
          const qrCanvas = qrcodeEl.querySelector('canvas');
          if (qrCanvas) {
            this.qrCodeDataUrl = qrCanvas.toDataURL('image/png');
          }
        });
      });
    },

    // 预加载图片
    async preloadImages() {
      try {
        // 预加载Logo
        const logoImg = new Image();
        logoImg.crossOrigin = 'anonymous';
        this.logoDataUrl = await new Promise((resolve) => {
          logoImg.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = logoImg.width;
            canvas.height = logoImg.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(logoImg, 0, 0);
            resolve(canvas.toDataURL('image/png'));
          };
          logoImg.onerror = () => {
            resolve(this.createPlaceholderImage());
          };
          logoImg.src = require('@/assets/img/logo.png');
        });
      } catch (error) {
        console.error('预加载图片失败:', error);
      }
    },

    // 加载图片并处理跨域
    loadImage(src) {
      return new Promise((resolve, reject) => {
        if (!src || src === this.placeholderImage) {
          reject(new Error('无有效图片'));
          return;
        }

        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        img.onload = () => {
          try {
            // 创建Canvas并转换为data URL
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            
            // 转换为data URL避免跨域问题
            const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
            resolve({
              dataUrl,
              width: img.width,
              height: img.height
            });
          } catch (error) {
            reject(error);
          }
        };
        
        img.onerror = (error) => {
          console.warn('图片加载失败:', src, error);
          reject(new Error('图片加载失败'));
        };
        
        // 添加缓存破坏参数
        const url = new URL(src, window.location.href);
        url.searchParams.set('_t', Date.now());
        img.src = url.toString();
        
        // 设置超时
        setTimeout(() => {
          if (!img.complete) {
            reject(new Error('图片加载超时'));
          }
        }, 10000);
      });
    },

    // 绘制圆角矩形
    drawRoundedRect(ctx, x, y, width, height, radius) {
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + width - radius, y);
      ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
      ctx.lineTo(x + width, y + height - radius);
      ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
      ctx.lineTo(x + radius, y + height);
      ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.closePath();
    },

    // 绘制文字（自动换行）
    drawText(ctx, text, x, y, maxWidth, lineHeight = 1.2) {
      const words = text.split('');
      let line = '';
      let lineY = y;
      
      for (let i = 0; i < words.length; i++) {
        const testLine = line + words[i];
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;
        
        if (testWidth > maxWidth && i > 0) {
          ctx.fillText(line, x, lineY);
          line = words[i];
          lineY += lineHeight * parseInt(ctx.font);
        } else {
          line = testLine;
        }
      }
      
      ctx.fillText(line, x, lineY);
      return lineY;
    },

    // 使用Canvas生成海报
    async saveWithCanvas() {
      if (this.isSaving) return;
      
      this.isSaving = true;
      this.$toast.loading({
        message: '生成海报中...',
        duration: 0,
        forbidClick: true
      });

      try {
        // 1. 创建Canvas
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // 2. 设置尺寸（适配手机屏幕）
        const devicePixelRatio = window.devicePixelRatio || 1;
        const baseWidth = 375; // 设计稿宽度
        const baseHeight = 667; // 设计稿高度
        const scale = 2; // 输出2倍图
        
        canvas.width = baseWidth * scale * devicePixelRatio;
        canvas.height = baseHeight * scale * devicePixelRatio;
        
        // 3. 缩放Canvas
        ctx.scale(devicePixelRatio * scale, devicePixelRatio * scale);
        
        // 4. 绘制背景
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, baseWidth, baseHeight);
        
        // 5. 绘制主图片
        await this.drawMainImage(ctx, baseWidth, baseHeight);
        
        // 6. 绘制价格
        this.drawPrice(ctx, baseWidth, baseHeight);
        
        // 7. 绘制项目名称
        this.drawProjectName(ctx, baseWidth, baseHeight);
        
        // 8. 绘制标签
        this.drawTags(ctx, baseWidth, baseHeight);
        
        // 9. 绘制基本信息
        this.drawInfoSection(ctx, baseWidth, baseHeight);
        
        // 10. 绘制底部区域
        this.drawBottomSection(ctx, baseWidth, baseHeight);
        
        // 11. 保存图片
        await this.saveCanvasImage(canvas);
        
        this.$toast.success({
          message: '海报生成成功',
          duration: 1500,
          onClose: () => this.visible = false
        });
        
      } catch (error) {
        console.error('生成海报失败:', error);
        this.$toast.fail('生成失败: ' + error.message);
      } finally {
        this.isSaving = false;
        this.$toast.clear();
      }
    },

    // 绘制主图片
    async drawMainImage(ctx, width, height) {
      if (!this.info.ImagesList || this.info.ImagesList.length === 0) {
        // 绘制占位图
        ctx.fillStyle = '#F5F5F5';
        this.drawRoundedRect(ctx, 20, 20, width - 40, 200, 8);
        ctx.fill();
        
        ctx.fillStyle = '#999999';
        ctx.font = '14px PingFang SC, Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('暂无项目图片', width / 2, 120);
        return;
      }
      
      try {
        // 加载图片
        const imgData = await this.loadImage(this.info.ImagesList[0]);
        const img = new Image();
        
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = imgData.dataUrl;
        });
        
        // 计算图片位置和尺寸
        const imgX = 20;
        const imgY = 20;
        const imgWidth = width - 40;
        const imgHeight = 200;
        
        // 绘制圆角矩形遮罩
        ctx.save();
        this.drawRoundedRect(ctx, imgX, imgY, imgWidth, imgHeight, 8);
        ctx.clip();
        
        // 绘制图片（居中裁剪）
        const imgRatio = img.width / img.height;
        const containerRatio = imgWidth / imgHeight;
        
        let drawWidth, drawHeight, drawX, drawY;
        
        if (imgRatio > containerRatio) {
          // 图片更宽，按高度填充
          drawHeight = imgHeight;
          drawWidth = imgHeight * imgRatio;
          drawX = imgX - (drawWidth - imgWidth) / 2;
          drawY = imgY;
        } else {
          // 图片更高，按宽度填充
          drawWidth = imgWidth;
          drawHeight = imgWidth / imgRatio;
          drawX = imgX;
          drawY = imgY - (drawHeight - imgHeight) / 2;
        }
        
        ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
        ctx.restore();
        
      } catch (error) {
        console.warn('主图片绘制失败:', error);
        // 绘制错误占位图
        ctx.fillStyle = '#F5F5F5';
        this.drawRoundedRect(ctx, 20, 20, width - 40, 200, 8);
        ctx.fill();
        
        ctx.fillStyle = '#FF4444';
        ctx.font = '14px PingFang SC, Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('图片加载失败', width / 2, 120);
      }
    },

    // 绘制价格
    drawPrice(ctx, width, height) {
      const price = this.info.Price || '0';
      const priceY = 240;
      
      ctx.fillStyle = '#E64340';
      ctx.font = 'bold 16px PingFang SC, Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('约', width / 2 - 40, priceY);
      
      ctx.font = 'bold 24px PingFang SC, Arial, sans-serif';
      ctx.fillText(price, width / 2, priceY);
      
      ctx.font = 'bold 16px PingFang SC, Arial, sans-serif';
      ctx.fillText('元/㎡', width / 2 + 40, priceY);
    },

    // 绘制项目名称
    drawProjectName(ctx, width, height) {
      const projectName = this.info.ProjectName || '项目名称';
      const nameY = 270;
      
      ctx.fillStyle = '#333333';
      ctx.font = 'bold 18px PingFang SC, Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(projectName, width / 2, nameY);
    },

    // 绘制标签
    drawTags(ctx, width, height) {
      const tagY = 300;
      let currentX = 20;
      
      // 绘制预售许可证标签
      if (this.info.PreSalePermit) {
        ctx.fillStyle = '#F3EDE2';
        ctx.font = '12px PingFang SC, Arial, sans-serif';
        const tagText = this.info.PreSalePermit;
        const tagWidth = ctx.measureText(tagText).width + 16;
        
        this.drawRoundedRect(ctx, currentX, tagY - 12, tagWidth, 24, 12);
        ctx.fill();
        
        ctx.fillStyle = '#95886F';
        ctx.textAlign = 'left';
        ctx.fillText(tagText, currentX + 8, tagY);
        
        currentX += tagWidth + 10;
      }
      
      // 绘制其他标签
      if (this.info.Tags && this.info.Tags.length > 0) {
        ctx.fillStyle = '#95886F';
        ctx.font = '12px PingFang SC, Arial, sans-serif';
        ctx.textAlign = 'left';
        
        const tagsText = this.info.Tags.join(' / ');
        ctx.fillText(tagsText, currentX, tagY);
      }
    },

    // 绘制基本信息区域
    drawInfoSection(ctx, width, height) {
      const infoY = 340;
      const infoHeight = 80;
      const itemWidth = (width - 40) / 3;
      
      // 绘制分割线
      ctx.beginPath();
      ctx.moveTo(20, infoY);
      ctx.lineTo(width - 20, infoY);
      ctx.strokeStyle = '#F0F0F0';
      ctx.lineWidth = 1;
      ctx.stroke();
      
      // 绘制三个信息项
      const items = [
        { label: this.info.BuildingCategory || '--', value: '类型' },
        { label: this.info.AreaSegment || '--', value: '面积段' },
        { label: this.info.FloorHeight || '--', value: '层高' }
      ];
      
      items.forEach((item, index) => {
        const centerX = 20 + (index + 0.5) * itemWidth;
        
        // 绘制标签
        ctx.fillStyle = '#333333';
        ctx.font = 'bold 16px PingFang SC, Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(item.label, centerX, infoY + 30);
        
        // 绘制描述
        ctx.fillStyle = '#999999';
        ctx.font = '12px PingFang SC, Arial, sans-serif';
        ctx.fillText(item.value, centerX, infoY + 50);
      });
      
      // 绘制底部线
      ctx.beginPath();
      ctx.moveTo(20, infoY + infoHeight);
      ctx.lineTo(width - 20, infoY + infoHeight);
      ctx.strokeStyle = '#F0F0F0';
      ctx.lineWidth = 1;
      ctx.stroke();
    },

    // 绘制底部区域（Logo和二维码）
    drawBottomSection(ctx, width, height) {
      const bottomY = height - 120;
      
      // 绘制Logo
      if (this.logoDataUrl) {
        const logoImg = new Image();
        logoImg.src = this.logoDataUrl;
        
        const logoWidth = 110;
        const logoHeight = 40;
        const logoX = 20;
        const logoY = bottomY + 20;
        
        ctx.drawImage(logoImg, logoX, logoY, logoWidth, logoHeight);
      }
      
      // 绘制二维码区域
      const qrX = width - 100;
      const qrY = bottomY;
      const qrSize = 80;
      
      // 绘制二维码
      if (this.qrCodeDataUrl) {
        const qrImg = new Image();
        qrImg.src = this.qrCodeDataUrl;
        ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
      }
      
      // 绘制二维码提示文字
      ctx.fillStyle = '#999999';
      ctx.font = '12px PingFang SC, Arial, sans-serif';
      ctx.textAlign = 'right';
      this.drawText(ctx, '长按识别二维码', qrX - 10, qrY + qrSize + 20, 80);
    },

    // 保存Canvas图片
    async saveCanvasImage(canvas) {
      return new Promise((resolve, reject) => {
        // 转换为Blob
        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error('生成图片失败'));
            return;
          }
          
          const dataUrl = URL.createObjectURL(blob);
          const isWechat = /MicroMessenger/i.test(navigator.userAgent);
          
          if (isWechat && window.wx && window.wx.saveImageToPhotosAlbum) {
            // 微信环境
            window.wx.saveImageToPhotosAlbum({
              filePath: dataUrl,
              success: () => {
                URL.revokeObjectURL(dataUrl);
                resolve();
              },
              fail: (error) => {
                URL.revokeObjectURL(dataUrl);
                reject(new Error('微信保存失败'));
              }
            });
          } else {
            // 其他浏览器
            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = `项目详情_${this.info.ProjectName || '海报'}_${new Date().getTime()}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // 延迟清理
            setTimeout(() => {
              URL.revokeObjectURL(dataUrl);
            }, 1000);
            
            resolve();
          }
        }, 'image/png', 1.0);
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

.save-button :deep(.van-button--loading) {
  opacity: 0.8;
}
</style>
