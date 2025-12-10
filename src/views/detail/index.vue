<template>
  <div class="page">
    <van-nav-bar
      :title="title"
      :left-arrow="!isShow"
      fixed
      @click-left="onClickLeft"
    />

    <!-- 加载状态 -->
    <div class="loading-container" v-if="loading">
      <van-loading type="spinner" size="48" color="#B1B2B1" />
      <div class="loading-text">加载中...</div>
    </div>

    <!-- 内容区域，只有当loading为false时显示 -->
    <div v-else>
      <!-- 顶部滚动 Banner -->
      <div class="banner-container" v-if="info.MediaList && info.MediaList.length > 0">
      <van-swipe :autoplay="3000" indicator-color="#fff" class="detail-swipe">
        <!-- 动态生成 Banner 项 -->
        <van-swipe-item v-for="(item, index) in info.MediaList" :key="index" class="swipe-item">
          <!-- 图片 Banner -->
          <img :src="item.url" alt="项目图片" class="detail-img" @click="previewImage(index, 'media')" />
        </van-swipe-item>
      </van-swipe>
      
      <!-- VR 按钮 -->
      <div class="vr-button" v-if="info.VRUrl" @click="goToVR">
        <van-icon name="eye-o" size="16" color="#fff" />
        <span>VR 看房</span>
      </div>
    </div>

    <!-- 价格信息 -->
    <div class="price-section">
      <div class="price">约 <span class="price-number">{{info.Price}}</span> 元/㎡</div>
      <div class="project-name">{{info.ProjectName}}</div>
      <div class="property-tags">
        <span class="tag">{{info.PreSalePermit}}</span>
        <span class="tags-container">
          <span v-for="(tag, tagIndex) in info.Tags" :key="tagIndex">
            <span class="tag-text">{{ tag }}</span>
            <span class="tag-slash" v-if="tagIndex < info.Tags.length - 1"> / </span>
          </span>
        </span>
      </div>
    </div>

    <!-- 项目基本信息 -->
    <div class="info-section">
      <div class="info-item">
        <div class="info-label">{{info.PropertyType}}</div>
        <div class="info-value">业态</div>
      </div>
      <div class="info-item">
        <div class="info-label">{{info.AreaSegment}}</div>
        <div class="info-value">面积段</div>
      </div>
      <div class="info-item">
        <div class="info-label">{{info.FloorHeight}}</div>
        <div class="info-value">层高</div>
      </div>
    </div>

    <!-- 项目地址 -->
    <div class="address-section">
      <div class="address-item" @click="openNavigation">
        <span class="address-text">{{info.Address}}</span>
        <img src="@/assets/img/address-icon.png" alt="" />
      </div>
    </div>

    <!-- 项目详细信息 -->
    <div class="detail-info-section">
      <div class="detail-info-item">
        <div class="detail-info-label">入市时间：</div>
        <div class="detail-info-value">{{info.LaunchTime}}</div>
      </div>
      <div class="detail-info-item">
        <div class="detail-info-label">建筑类别：</div>
        <div class="detail-info-value">{{info.BuildingCategory}}</div>
      </div>
      <div class="detail-info-item">
        <div class="detail-info-label">装修情况：</div>
        <div class="detail-info-value">{{info.DecorationStatus}}</div>
      </div>
      <div class="detail-info-item">
        <div class="detail-info-label">预售证：</div>
        <div class="detail-info-value">{{info.PreSalePermit}}</div>
      </div>
      <div class="detail-info-item">
        <div class="detail-info-label">物业费：</div>
        <div class="detail-info-value">{{info.PropertyFee}}</div>
      </div>
      <div class="detail-info-item">
        <div class="detail-info-label">项目介绍：</div>
        <div class="detail-info-value project-intro">
          {{info.ProjectIntro}}
        </div>
      </div>
    </div>

    <!-- 工区展示 -->
    <div class="section-title">工区展示</div>
    <div class="work-area-section">
      <div class="work-area-item" v-for="(item, index) in info.workAreaImages" :key="index">
        <img
          :src="item"
          alt="工区图片"
          class="work-area-img"
          @click="previewImage(index, 'workArea')"
        />
      </div>
    </div>

    <!-- 图片预览组件 -->
    <van-image-preview
      v-model="showPreview"
      :images="previewImages"
      :start-position="previewIndex"
    />

    <!-- 楼盘推荐 -->
    <div class="section-title">楼盘推荐</div>
    <div class="recommend-section">
      <div class="recommend-item" v-for="item in recommondList" :key="item.Id" @click="goToDetail(item.Id)">
        <div class="recommend-img-container">
          <img
            :src="item.ImagesUrl"
            alt="推荐楼盘"
            class="recommend-img"
          />
        </div>
        <div class="recommend-info">
          <div class="recommend-name">{{item.ProjectName}}</div>
          <div class="recommend-price">
            约 <span class="recommend-price-number">{{item.Price}}</span> 元/㎡
          </div>
          <div class="property-tags">
            <span class="tag">{{item.PreSalePermit}}</span>
            <span class="tags-container">
              <span
                v-for="(tag, tagIndex) in item.Tags"
                :key="tagIndex"
              >
                <span class="tag-text">{{ tag }}</span>
                <span class="tag-slash" v-if="tagIndex < 2"> / </span>
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部固定操作按钮 -->
    <div class="bottom-actions" v-if="!loading">
      <div class="action-item share" @click="onShare">
        <img src="../../assets/img/share.png" alt=""  class="share-icon"/>
      </div>
      <div class="action-item" @click="onView">
        <span class="action-text">预约看房{{$route.query.id}}</span>
      </div>
      <div class="action-item call" @click="onCall">
        <span class="action-text">电话咨询</span>
      </div>
    </div>

    <!-- 电话咨询弹窗 -->
    <van-action-sheet
      v-model="showCallSheet"
      title="拨打电话"
      :actions="callActions"
      cancel-text="取消"
      @select="onCallSelect"
    />

    <!-- 引入分享弹窗组件 -->
    <SharePop :showSharePopup.sync="showSharePopup"  :info="info" />
    
    <!-- 导航选择菜单 -->
    <van-action-sheet
      v-model="showNavigationSheet"
      :actions="navigationActions"
      @select="onNavigationSelect"
      cancel-text="取消"
      title="选择导航应用"
    />
    </div>
  </div>
</template>

<script>
import SharePop from './pop.vue';
import axios from 'axios';

export default {
  components: {
    SharePop
  },
  data() {
    return {
      title: this.$route.meta.title,
      isShow: this.$route.meta.isLevel,
      videoPlaying: false,
      // 工区图片数据
      workAreaImages: [],
      // 图片预览数据
      showPreview: false,
      previewIndex: 0,
      previewType: 'media', // 'media' 或 'workArea'
      previewImages: [], // 当前预览的图片列表
      // 电话咨询弹窗数据
      showCallSheet: false,
      callActions: [],
      recommondList: [],
      info: {},
      // 分享弹窗数据
      showSharePopup: false,
      // 加载状态
      loading: true,
      // 导航选择弹窗数据
      showNavigationSheet: false,
      navigationActions: []
    }
  },
  computed: {
    // 提取图片 URL 数组，用于预览组件
    workAreaImageUrls() {
      return this.workAreaImages.map(item => item.url);
    }
  },
  watch: {
    // 监听路由参数变化，当id变化时重新获取数据
    '$route.params.id'(newId, oldId) {
      if (newId !== oldId) {
        // 请求开始，设置loading为true
        this.loading = true;
        
        // 并行执行所有请求，重新获取数据
        Promise.all([
          this.getDetailInfo(),
          this.getPhone(),
          this.getList()
        ]).finally(() => {
          // 所有请求完成后，设置loading为false
          this.loading = false;
        });
      }
    }
  },
  mounted() {
    // 请求开始，设置loading为true
    this.loading = true;
    
    // 并行执行所有请求
    Promise.all([
      this.getDetailInfo(),
      this.getPhone(),
      this.getList()
    ]).finally(() => {
      // 所有请求完成后，设置loading为false
      this.loading = false;
    });
  },
  methods: {
    getPhone(){
      return axios.post(`${process.env.VUE_APP_BASE_API}/system/new/index`, null, {
        params: {
          pageIndex: 1,
          pageSize: 1
        }
      }).then((response) => {
        const data = response.data || {};
     
        
  
        this.callActions = [
          { name: data.list[0].MainHotline, phone: data.list[0].MainHotline },
          { name: data.list[0].ShareOfficeHotline, phone: data.list[0].ShareOfficeHotline }
        ]
      })
    },
    getDetailInfo() {
      return axios.post(`${process.env.VUE_APP_BASE_API}/system/newdetial/index`,null, {
        params: {
          pageIndex:1,
          pageSize:10,
          id:this.$route.params.id
        }
      }).then((response) => {
        const data = response.data || {};
      
        
        // 处理ImagesUrl，分割成数组并拼接上VUE_APP_BASE_API
        // 首先获取正确的ImagesUrl，根据接口返回数据结构
        let imagesUrl = '';
        if (data.list && data.list.length > 0) {
          // 如果data有list数组，使用第一个元素的ImagesUrl
          imagesUrl = data.list[0].ImagesUrl || '';
        } else {
          // 否则直接使用data.ImagesUrl
          imagesUrl = data.ImagesUrl || '';
        }
        // 处理以逗号结尾的情况，确保不会产生空数组项
        const imagesList = [];
        imagesUrl.split(',').forEach(url => {
          // 移除每个url的空格
          const trimmedUrl = url.trim();
          // 只有非空的url才添加到数组中
          if (trimmedUrl) {
            // 拼接上VUE_APP_BASE_API
            imagesList.push(`${process.env.VUE_APP_BASE_API}${trimmedUrl}`);
          }
        });

        
        this.info ={
          ...data.list[0],
          Tags: data.list[0].Tags.split('/'),
          workAreaImages: imagesList, // 设置为数组
          ImagesList: imagesList, // 同时保存到ImagesList，方便其他地方使用
          MediaList: imagesList.map(url => ({ url, isVideo: false })) // 简化为只包含图片的列表
        };
      })
    },

    getList() {
      return axios.post(`${process.env.VUE_APP_BASE_API}/system/newdetial/index`,null, {
        params: {
          pageIndex:1,
          pageSize:5,
        }
      }).then((response) => {
        const data = response.data || {};
        this.recommondList =  data.list.map(item => ({
          ...item,
          Tags: item.Tags.split('/'),
          ImagesUrl: `${process.env.VUE_APP_BASE_API}${item.MainImageUrl.split(',').shift().trim()}`
        }));
        

        
        
      })
    },
    onClickLeft() {
      this.$router.go(-1);
    },

    onShare() {
      // 显示分享弹窗
      this.showSharePopup = true;
    },
    onView() {
      // 跳转到预约看房页面
      this.$router.push({ name: 'Appointment', params: { id: this.$route.params.id } });
    },
    onCall() {
      // 显示电话咨询弹窗
      this.showCallSheet = true;
    },
    // 电话选择处理
    onCallSelect(action) {
      // 拨打电话
      window.location.href = `tel:${action.phone}`;
      // 关闭弹窗
      this.showCallSheet = false;
    },
    // 图片预览方法
    previewImage(index, type = 'media') {
      this.previewIndex = index;
      this.previewType = type;
      
      // 根据类型设置预览图片列表
      if (type === 'media') {
        this.previewImages = this.info.MediaList ? this.info.MediaList.map(item => item.url) : [];
      } else if (type === 'workArea') {
        this.previewImages = this.info.workAreaImages || [];
      }
      
      this.showPreview = true;
    },
    // 跳转到VR看房页面
    goToVR() {
      if (this.info.VRUrl) {
        // 跳转到VR页面
        window.location.href = this.info.VRUrl;
      }
    },

    // 跳转到详情页
    goToDetail(itemId) {
      // 获取当前路由的id参数
      const currentId = this.$route.params.id;
      
      // 只有当当前id与要跳转的id不同时，才执行跳转，避免重复导航
      if (currentId !== itemId) {
        // 使用 replace 方法替换当前路由，避免历史记录堆积
        this.$router.replace(`/detail/${itemId}`).then(() => {
          // 跳转成功后，回到页面顶部
          window.scrollTo({ top: 0, behavior: 'smooth' });
        });
      } else {
        // 如果id相同，回到页面顶部
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },
    // 检测手机安装了哪些导航应用
    detectNavigationApps() {
      return new Promise((resolve) => {
        // 初始化检测结果
        const installedApps = {
          baidu: false,
          amap: false,
          tencent: false
        };
        
        // 计数器，用于跟踪检测完成的数量
        let completed = 0;
        const totalApps = 3;
        
        // 检测完成回调
        const checkComplete = () => {
          completed++;
          if (completed === totalApps) {
            resolve(installedApps);
          }
        };
        
        // 检测百度地图
        this.checkAppInstalled('baidumap://').then(() => {
          installedApps.baidu = true;
        }).catch(() => {
          installedApps.baidu = false;
        }).finally(checkComplete);
        
        // 检测高德地图
        this.checkAppInstalled('iosamap://').then(() => {
          installedApps.amap = true;
        }).catch(() => {
          installedApps.amap = false;
        }).finally(checkComplete);
        
        // 检测腾讯地图
        this.checkAppInstalled('qqmap://').then(() => {
          installedApps.tencent = true;
        }).catch(() => {
          installedApps.tencent = false;
        }).finally(checkComplete);
      });
    },
    // 检测应用是否安装
    checkAppInstalled(url) {
      return new Promise((resolve, reject) => {
        // 创建iframe尝试打开URL
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.src = url;
        
        // 监听加载失败事件
        iframe.onerror = () => {
          document.body.removeChild(iframe);
          reject(new Error('应用未安装'));
        };
        
        // 尝试打开URL
        document.body.appendChild(iframe);
        
        // 1秒后移除iframe，不管成功与否
        setTimeout(() => {
          document.body.removeChild(iframe);
          resolve();
        }, 1000);
      });
    },
    // 唤起导航选择菜单
    openNavigation() {
      if (!this.info.Address) return;
      
      // 默认显示百度地图、高德地图和腾讯地图，不要浏览器打开
      const actions = [
        { name: '百度地图', action: 'baidu' },
        { name: '高德地图', action: 'amap' },
        { name: '腾讯地图', action: 'tencent' }
      ];
      
      // 更新导航选项
      this.navigationActions = actions;
      
      // 显示导航选择菜单
      this.showNavigationSheet = true;
    },
    // 处理导航选择
    onNavigationSelect(action) {
      if (!this.info.Address) return;
      
      // 项目地址
      const address = this.info.Address;
      // 地址编码，确保可以被导航app识别
      const encodedAddress = encodeURIComponent(address);
      
      // 获取设备类型
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
      
      // 导航app下载地址（官方网站下载页面，浏览器访问后会跳转至对应应用商店）
      const downloadUrls = {
        baidu: {
          ios: 'https://map.baidu.com/mobile/webapp/index/index/#/index',
          android: 'https://map.baidu.com/mobile/webapp/index/index/#/index'
        },
        amap: {
          ios: 'https://www.amap.com/download/',
          android: 'https://www.amap.com/download/'
        },
        tencent: {
          ios: 'https://map.qq.com/download.html',
          android: 'https://map.qq.com/download.html'
        }
      };
      
      // 获取经纬度
      const lat = this.info.Clat || '';
      const lng = this.info.Clng || '';
      const latLng = `${lat},${lng}`;
      
      // 导航app URL Scheme（添加经纬度参数，让app能直接导航）
      const appUrls = {
        baidu: {
          // 百度地图导航接口，添加经纬度参数
          ios: `baidumap://map/direction?origin=我的位置&destination=${latLng}|${encodedAddress}&mode=driving&src=iosapp`,
          android: `baidumap://map/direction?origin=我的位置&destination=${latLng}|${encodedAddress}&mode=driving&src=andr`
        },
        amap: {
          // 高德地图导航接口，添加经纬度参数
          ios: `iosamap://navi?poiname=${encodedAddress}&lat=${lat}&lon=${lng}&dev=0&style=2`,
          android: `amapuri://route/plan/?dname=${encodedAddress}&dlat=${lat}&dlon=${lng}&dev=0&t=0`
        },
        tencent: {
          // 腾讯地图导航接口，添加经纬度参数
          ios: `qqmap://map/routeplan?from=我的位置&to=${encodedAddress}&tocoord=${latLng}&type=drive`,
          android: `qqmap://map/routeplan?from=我的位置&to=${encodedAddress}&tocoord=${latLng}&type=drive`
        }
      };
      
      // 根据选择的导航app执行不同的操作
      const selectedApp = action.action;
      const appUrl = isIOS ? appUrls[selectedApp].ios : appUrls[selectedApp].android;
      const downloadUrl = isIOS ? downloadUrls[selectedApp].ios : downloadUrls[selectedApp].android;
      
      // 检测当前浏览器是否支持visibilitychange事件
      const supportsVisibilityChange = typeof document.hidden !== 'undefined';
      
      // 尝试打开应用
      window.location.href = appUrl;
      
      // 仅在支持visibilitychange事件的浏览器中执行检测逻辑
      if (supportsVisibilityChange) {
        // 检测页面可见性变化，判断应用是否成功打开
        let appOpened = false;
        
        // 页面隐藏时，表示应用可能已成功打开
        const handleVisibilityChange = () => {
          if (document.hidden) {
            appOpened = true;
          }
        };
        
        // 添加可见性变化事件监听
        document.addEventListener('visibilitychange', handleVisibilityChange);
        
        // 设置定时器，2000ms后检查是否成功打开应用
        setTimeout(() => {
          // 移除事件监听
          document.removeEventListener('visibilitychange', handleVisibilityChange);
          
          // 如果页面没有隐藏，说明应用没有打开，跳转到对应官方的下载网址
          if (!appOpened) {
            // 使用setTimeout再次延迟，确保应用有足够时间打开
            setTimeout(() => {
              // 再次检查页面是否隐藏
              if (!document.hidden) {
                window.location.href = downloadUrl;
              }
            }, 500);
          }
        }, 2000);
      }
      
      // 关闭导航选择菜单
      this.showNavigationSheet = false;
    }
  },
};
</script>

<style scoped>
.page {
  padding-top: 46px;
  /* 基础底部padding，确保内容不会被底部操作栏盖住 */
  padding-bottom: 80px;
  /* iOS Safari 10+ (旧版浏览器优先) */
  padding-bottom: calc(80px + constant(safe-area-inset-bottom));
  /* iOS Safari 11+ (新版浏览器覆盖旧版) */
  padding-bottom: calc(80px + env(safe-area-inset-bottom));
  background-color: #fff;
  position: relative;
  min-height: 100vh;
  box-sizing: border-box;
}

/* 加载状态样式 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  width: 100%;
  background-color: #fff;
}

.loading-text {
  margin-top: 10px;
  font-size: 14px;
  color: #999;
}

/* 顶部 Banner 样式 */
.banner-container {
  width: 100%;
  position: relative;
}

.detail-swipe {
  width: 100%;
  aspect-ratio: 4/3;
  overflow: hidden;
}

.swipe-item {
  width: 100%;
  height: 100%;
  position: relative;
}

.detail-img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
}

/* 视频样式 */
.video-container {
  width: 100%;
  height: 100%;
  position: relative;
}

.detail-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  cursor: pointer;
}

/* VR按钮样式 */
.vr-button {
  position: absolute;
  bottom: 8px;
  right: 8px;
  display: flex;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.7);
  color: #fff;
  padding: 8px 15px;
  border-radius: 20px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.vr-button:hover {
  background-color: rgba(0, 0, 0, 0.9);
  transform: translateY(-2px);
}

.vr-button span {
  margin-left: 5px;
}



/* 价格信息 */
.price-section {
  padding: 15px;
  background-color: #fff;
}

.price {
  font-size: 13px;
  color: #e64340;
  margin-bottom: 10px;
}

.price-number {
  color: #e64340;
  font-weight: bold;
  font-size: 24px;
}

.project-name {
  font-size: 20px;
  font-weight: bold;
  color: #191b2a;
  margin-bottom: 10px;
}

.property-tags {
  display: flex;
  flex-wrap: wrap;
  color: #95886f;
  align-items: center;
}

.tag {
  font-size: 13px;
  line-height: 13px;
  color: #95886f;
  background-color: #f3ede2;
  padding: 4px 12px;
  border-radius: 12px;
  margin-right: 8px;
  margin-bottom: 8px;
}

.tags-container {
  display: flex;
  align-items: center;
  white-space: nowrap;
  overflow: hidden;
  margin-bottom: 8px;
}

.tag-text {
  font-size: 13px;
  color: #95886f;
}

.tag-slash {
  font-size: 12px;
  line-height: 12px;
  color: #95886f;
  margin: 0 4px;
}

/* 项目基本信息 */
.info-section {
  display: flex;
  padding: 0 15px 15px;
}

.info-item {
  flex: 1;
  text-align: left;
}

.info-label {
  font-size: 18px;
  font-weight: bold;
  color: #191b2a;
  margin-bottom: 5px;
}

.info-value {
  font-size: 14px;
  color: #b1b2b1;
}

/* 项目地址 */
.address-section {
  padding: 0 15px;
  margin: 10px 0;
}

.address-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px;
  background-image: url("../../assets/img/address-bg.png");
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  border-radius: 10px;
}

.address-text {
  font-size: 14px;
  color: #33364c;
  margin-right: 10px;
  flex: 1;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.5;
}

.address-item img {
  width: 26px;
  height: 26px;
  flex-shrink: 0;
}

/* 项目详细信息 */
.detail-info-section {
  padding: 15px;
  background-color: #fff;
  border-bottom: 1px solid #f0f0f0;
}

.detail-info-item {
  display: flex;
  margin-bottom: 10px;
}

.detail-info-label {
  font-size: 14px;
  color: #b1b2b1;
  width: 80px;
  flex-shrink: 0;
}

.detail-info-value {
  font-size: 14px;
  color: #191b2a;
  flex: 1;
}

.project-intro {
  line-height: 1.5;
}

/* 工区展示 */
.section-title {
  font-size: 16px;
  font-weight: bold;
  padding: 24px 15px 0 15px;
  color: #191b2a;
}

.work-area-section {
  display: flex;
  padding: 15px 15px 0 15px;
  overflow-x: auto;
  /* 隐藏滚动条 */
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.work-area-section::-webkit-scrollbar {
  display: none;
}

.work-area-item {
  /* 屏幕显示两个半图片 */
  width: calc(40vw - 15px);
  margin-right: 10px;
  flex-shrink: 0;
}

.work-area-img {
  width: 100%;
  height: 120px;
  object-fit: cover;
  border-radius: 8px;
}

/* 楼盘推荐 */
.recommend-section {
  padding: 15px;
  background-color: #fff;
}

.recommend-item {
  display: flex;
  margin-bottom: 15px;
}

.recommend-img-container {
  width: 100px;
  height: 80px;
  margin-right: 10px;
  flex-shrink: 0;
}

.recommend-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
}

.recommend-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-width: 0;
}

.recommend-name {
  font-size: 14px;
  font-weight: bold;
  color: #191b2a;
  margin-bottom: 5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.recommend-price {
  font-size: 13px;
  color: #e64340;
  margin-bottom: 5px;
}

.recommend-price-number {
  font-weight: bold;
  font-size: 16px;
}

/* 底部固定操作按钮 */
.bottom-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  display: flex;
  background-color: #fff;
  border-top: 1px solid #f0f0f0;
  padding: 10px 10px;
  /* 基础底部padding，确保至少10px */
  padding-bottom: 10px;
  /* iOS Safari 10+ (旧版浏览器优先) */
  padding-bottom: calc(10px + constant(safe-area-inset-bottom));
  /* iOS Safari 11+ (新版浏览器覆盖旧版) */
  padding-bottom: calc(10px + env(safe-area-inset-bottom));
  box-sizing: border-box;
  z-index: 100;
}

.action-item {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
  border-radius: 8px;
  margin-right: 10px;
  cursor: pointer;
  font-weight: bold;
}

.action-item.share {
  width: 26px;
  height: 26px;
  background-color: transparent;
  padding: 10px 5px;

 
}

 .share-icon {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 8px;
  }

.action-item:nth-child(2),
.action-item:nth-child(3) {
  flex: 1;
  font-size: 14px;
}

.action-item:last-child {
  margin-right: 0;
}

/* 预约看房按钮 */
.action-item:nth-child(2) {
  background-color: #efe6d4;
  color: #9e875a;
}

/* 电话咨询按钮 */
.action-item.call {
  background-color: #33364c;
  color: #b6a37e;
}

.action-text {
  margin-left: 5px;
}



.action-item:nth-child(2) .action-text,
.action-item:nth-child(3) .action-text {
  margin-left: 0;
}


</style>
