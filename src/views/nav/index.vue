<template>
  <div class="page">
    <!-- 腾讯地图容器 -->
    <div id="tencent-map" class="tencent-map"></div>
    
    <!-- 底部点位信息展示 - 移回页面根容器 -->
    <div v-if="selectedPoint" class="point-info" @click="handlePointClick(selectedPoint)">
      <div class="info-content">
        <!-- 左边图片区域 -->
        <div class="info-image">
          <img :src="selectedPoint.MainImageUrl" :alt="selectedPoint.name" class="main-image" />
        </div>
        
        <!-- 右边信息区域 -->
        <div class="info-text">
          <div class="property-price">约 <span class="price">{{ selectedPoint.price }}</span> 元/㎡</div>
          <div class="info-header">
            <h3>{{ selectedPoint.name }}</h3>
           
          </div>
          <div class="info-tags">
            <span v-for="tag in selectedPoint.Tags" :key="tag" class="tag">{{ tag }}</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 导航选择菜单 -->
    <van-action-sheet
      v-model="showNavigationSheet"
      :actions="navigationActions"
      @select="onNavigationSelect"
      cancel-text="取消"
      title="选择导航应用"
    />
  </div>
</template>

<script>
import axios from 'axios';
export default {
  data() {
    return {
      map: null, // 地图实例
      geolocation: null, // 定位实例
      marker: null, // 当前位置标记
      projectMarkers: null, // 项目标记实例
      mapData: [],
      userLocation: null, // 用户当前位置
      selectedPoint: null, // 选中的点位数据
      // 导航相关数据
      showNavigationSheet: false, // 导航选择菜单是否显示
      navigationActions: [] // 导航选项
    }
  },
  mounted() {
    // 加载腾讯地图API
    this.loadTencentMap();
    this.getMapData();
  },
  methods: {
    getMapData(){
      axios.post(`${process.env.VUE_APP_BASE_API}/system/newdetial/index`, null, {
        params: {
          pageIndex: 1,
          pageSize: 9999
        }
      }).then((response) => {
        // 处理接口返回的数据
        const data = response.data.list || [];
        this.mapData = data.map(item => ({
          id: item.Id,
          MainImageUrl: `${process.env.VUE_APP_BASE_API}${item.MainImageUrl.split(',').shift().trim()}`,
          name: item.ProjectName,
          price: item.Price,
          Tags: item.Tags.split('/'),
          lat: item.Clat,
          lng: item.Clng
        }));

        console.log(this.mapData,666);
        
        // 地图初始化完成后，标记点位
        if (this.map) {
          this.addMarkers();
        }
        
      })
    },

    // 加载腾讯地图API
    loadTencentMap() {
      // 检查腾讯地图API是否已经加载
      if (window.TMap) {
        this.initMap();
      } else {
        // 动态加载腾讯地图API
        const script = document.createElement('script');
        script.type = 'text/javascript';
        
        // 使用提供的腾讯地图密钥
        const key = 'EEIBZ-EYZYD-2HX4A-HNJDF-T2362-FDFE5';
        script.src = `https://map.qq.com/api/gljs?v=1.exp&key=${key}`;
        
        // 添加加载完成和失败处理
        script.onload = () => {
          // 脚本加载完成后初始化地图
          this.initMap();
        };
        
        script.onerror = () => {
          console.error('腾讯地图API加载失败，请检查密钥是否正确或网络连接是否正常');
          this.showMapError();
        };
        
        document.body.appendChild(script);
      }
    },
    
    // 显示地图加载错误
    showMapError() {
      const mapContainer = document.getElementById('tencent-map');
      if (mapContainer) {
        mapContainer.innerHTML = `
          <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; text-align: center; padding: 20px;">
            <h3 style="color: #ff4444; margin-bottom: 10px;">地图加载失败</h3>
            <p style="color: #666; margin-bottom: 20px;">请检查腾讯地图密钥是否正确配置</p>
            <a href="https://lbs.qq.com/dev/console/application/mine" target="_blank" style="color: #1989fa; text-decoration: underline;">
              前往腾讯地图开放平台管理密钥
            </a>
          </div>
        `;
      }
    },
    
    // 初始化地图
    initMap() {
      try {
        // 创建地图实例
        this.map = new window.TMap.Map(document.getElementById('tencent-map'), {
          center: new window.TMap.LatLng(31.5593, 120.2975), // 默认无锡
          zoom: 15
        });
        
        console.log('地图初始化成功:', this.map);
        
        // 定位到当前位置
        this.locateUser();
        
        // 如果已经有地图数据，添加标记
        if (this.mapData.length > 0) {
          this.addMarkers();
        }
      } catch (error) {
        console.error('地图初始化失败:', error);
        this.showMapError();
      }
    },
    
    // 在地图上添加标记点
    addMarkers() {
      try {
        console.log('开始添加标记，地图数据:', this.mapData.length, '条数据');
        
        // 清除旧的标记
        if (this.projectMarkers) {
          this.projectMarkers.setMap(null);
          console.log('清除旧标记成功');
        }
        
        // 准备标记数据
        const markerData = this.mapData.map(item => {
          console.log('处理项目数据:', item);
          return {
            id: item.id,
            styleId: 'project',
            position: new window.TMap.LatLng(item.lat, item.lng),
            properties: {
              name: item.name,
              price: item.price,
              tags: item.Tags
            }
          };
        });
        
        console.log('准备好的标记数据:', markerData.length, '个标记');
        
        // 创建项目标记
        this.projectMarkers = new window.TMap.MultiMarker({
          map: this.map,
          styles: {
            'project': new window.TMap.MarkerStyle({
              'width': 50,
              'height': 50,
              'anchor': {
                'x': 22.5,
                'y': 60
              },
              'src': require('@/assets/img/position.png') // 本地标记图标
            })
          },
          geometries: markerData
        });
        
        // 添加标记点击事件
        this.projectMarkers.on('click', (event) => {
          console.log('标记点击事件触发，完整事件对象:', event);
          // 检查事件对象结构，适配不同版本的API
          let clickedGeometry;
          if (event.detail && event.detail.geometry) {
            clickedGeometry = event.detail.geometry;
          } else if (event.detail && event.detail.features && event.detail.features.length > 0) {
            // 适配可能的features数组结构
            clickedGeometry = event.detail.features[0].geometry;
          } else if (event.geometry) {
            // 适配可能的直接geometry结构
            clickedGeometry = event.geometry;
          }
          
          if (clickedGeometry) {
            // 根据标记ID找到对应的完整mapData数据
            const clickedData = this.mapData.find(item => item.id === clickedGeometry.id);
            console.log('点击了标记:', clickedGeometry.properties);
            console.log('对应的完整mapData数据:', clickedData);
            
            // 更新选中的点位数据，用于底部信息展示
            this.selectedPoint = clickedData;
          } else {
            console.error('无法获取点击的标记数据，事件对象结构:', event);
          }
        });
        
        console.log('标记添加成功:', markerData.length, '个标记');
        
        // 如果已经定位到用户位置，找到最近的标记点
        if (this.userLocation) {
          this.findNearestMarker();
        } else {
          console.log('还没有用户位置，无法找到最近标记点');
        }
      } catch (error) {
        console.error('添加标记失败:', error);
      }
    },
    
    // 点击点位信息唤起导航选择菜单
    handlePointClick(point) {
      if (!point) return;
      
      // 保存当前选中的点位
      this.selectedPoint = point;
      
      // 默认显示百度地图、高德地图和腾讯地图
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
      if (!this.selectedPoint) return;
      
      // 项目地址（使用点位名称作为地址）
      const address = this.selectedPoint.name;
      // 地址编码，确保可以被导航app识别
      const encodedAddress = encodeURIComponent(address);
      
      // 获取经纬度
      const lat = this.selectedPoint.lat || '';
      const lng = this.selectedPoint.lng || '';
      const latLng = `${lat},${lng}`;
      
      // 获取设备类型
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
      
      // 导航app URL Scheme优化，针对微信浏览器和高德地图做特殊处理
      let appUrl = '';
      let downloadUrl = '';
      
      const selectedApp = action.action;
      
      // 高德地图特殊处理，使用更可靠的URL Scheme格式
      if (selectedApp === 'amap') {
        // 高德地图使用新的URL Scheme格式，确保在微信浏览器中也能尝试直接打开
        if (isIOS) {
          // iOS系统使用更可靠的高德URL Scheme
          appUrl = `iosamap://path?sourceApplication=applicationName&backScheme=applicationScheme&dlat=${lat}&dlon=${lng}&dname=${encodedAddress}&dev=0&t=0`;
        } else {
          // Android系统使用高德URL Scheme
          appUrl = `androidamap://viewMap?sourceApplication=applicationName&poiname=${encodedAddress}&lat=${lat}&lon=${lng}&dev=0`;
        }
        downloadUrl = isIOS ? 'https://apps.apple.com/cn/app/id461703208' : 'https://a.amap.com/';
      } 
      // 百度地图URL Scheme
      else if (selectedApp === 'baidu') {
        if (isIOS) {
          // iOS系统使用百度URL Scheme
          appUrl = `baidumap://map/direction?origin={{我的位置}}&destination=name:${encodedAddress}|latlng:${latLng}&mode=driving&coord_type=bd09ll`;
        } else {
          // Android系统使用百度URL Scheme
          appUrl = `bdapp://map/direction?origin={{我的位置}}&destination=name:${encodedAddress}|latlng:${latLng}&mode=driving&coord_type=bd09ll`;
        }
        downloadUrl = isIOS ? 'https://apps.apple.com/cn/app/id452186370' : 'https://map.baidu.com/zt/client/index/';
      } 
      // 腾讯地图URL Scheme
      else if (selectedApp === 'tencent') {
        if (isIOS) {
          // iOS系统使用腾讯URL Scheme
          appUrl = `qqmap://map/routeplan?from=我的位置&type=drive&to=${encodedAddress}&tocoord=${latLng}&policy=0&referer=OB4BZ-D4W3U-B7VVO-4PJWW-6TKDJ-WPB77`;
        } else {
          // Android系统使用腾讯URL Scheme
          appUrl = `qqmap://map/routeplan?type=drive&from=我的位置&fromcoord=CurrentLocation&to=${encodedAddress}&tocoord=${latLng}&policy=0&referer=OB4BZ-D4W3U-B7VVO-4PJWW-6TKDJ-WPB77`;
        }
        downloadUrl = isIOS ? 'https://apps.apple.com/cn/app/id481623192' : 'https://map.qq.com/mobile/guidedownload/';
      }
      
      // 尝试打开导航app
      const openApp = () => {
        window.location.href = appUrl;
        
        // 设置定时器，500ms后检查是否成功打开app，如果没有则跳转到下载页面
        setTimeout(() => {
          window.location.href = downloadUrl;
        }, 500);
      };
      
      // 执行打开app操作
      openApp();
      
      // 关闭导航选择菜单
      this.showNavigationSheet = false;
    },
    
    // 找到离用户最近的标记点并定位
    findNearestMarker() {
      try {
        console.log('开始查找最近标记点，用户位置:', this.userLocation);
        
        if (!this.userLocation || !this.mapData || this.mapData.length === 0) {
          console.log('没有用户位置或标记数据，无法查找最近标记点');
          return;
        }
        
        // 计算每个标记点到用户位置的距离
        let nearestMarker = null;
        let minDistance = Infinity;
        
        // 确保用户位置是TMap.LatLng实例
        const userLatLng = this.userLocation instanceof window.TMap.LatLng ? 
          this.userLocation : 
          new window.TMap.LatLng(this.userLocation.getLat(), this.userLocation.getLng());
        
        this.mapData.forEach(item => {
          // 使用Haversine公式计算两点之间的距离（米）
          const distance = this.calculateDistance(userLatLng.getLat(), userLatLng.getLng(), item.lat, item.lng);
          
          console.log('项目:', item.name, '距离:', distance, '米');
          
          if (distance < minDistance) {
            minDistance = distance;
            nearestMarker = item;
          }
        });
        
        if (nearestMarker) {
          console.log('找到最近的标记点:', nearestMarker.name, '距离:', minDistance, '米');
          
          // 定位到最近的标记点
          const nearestLatLng = new window.TMap.LatLng(nearestMarker.lat, nearestMarker.lng);
          this.map.setCenter(nearestLatLng);
          this.map.setZoom(16);
          
          // 使用setCenter替代panTo，避免scaleZoom错误
          // this.map.panTo(nearestLatLng, {
          //   duration: 1000 // 1秒动画
          // });
        }
      } catch (error) {
        console.error('查找最近标记点失败:', error);
      }
    },
    
    // Haversine公式计算两点之间的距离（米）
    calculateDistance(lat1, lon1, lat2, lon2) {
      const R = 6371e3; // 地球半径，单位为米
      const φ1 = lat1 * Math.PI / 180;
      const φ2 = lat2 * Math.PI / 180;
      const Δφ = (lat2 - lat1) * Math.PI / 180;
      const Δλ = (lon2 - lon1) * Math.PI / 180;
      
      const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
                Math.cos(φ1) * Math.cos(φ2) *
                Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      
      return R * c; // 距离，单位为米
    },
    
    // 定位到当前位置
    locateUser() {
      try {
        // 使用浏览器原生定位API获取当前位置
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition((position) => {
            // 获取定位结果
            const point = new window.TMap.LatLng(position.coords.latitude, position.coords.longitude);
            
            // 清除旧标记
            if (this.marker) {
              this.marker.setMap(null);
            }
            
            // 创建新标记
            this.marker = new window.TMap.MultiMarker({
              map: this.map,
              styles: {
                'default': {
                  'width': 25,
                  'height': 35,
                  'anchor': {
                    'x': 12.5,
                    'y': 35
                  }
                }
              },
              geometries: [
                {
                  'id': 'current',
                  'styleId': 'default',
                  'position': point
                }
              ]
            });
            
            // 中心点移动到当前位置
            this.map.setCenter(point);
            this.map.setZoom(17);
            
            // 存储用户位置
            this.userLocation = point;
            
            console.log('定位成功:', point);
            
            // 如果已经有地图标记，找到最近的标记点
            if (this.projectMarkers) {
              this.findNearestMarker();
            }
          }, (error) => {
            // 定位失败时的处理
            let errorMsg = '定位失败';
            
            // 根据错误信息显示具体错误
            switch (error.code) {
              case error.PERMISSION_DENIED:
                errorMsg = '定位权限被拒绝';
                break;
              case error.POSITION_UNAVAILABLE:
                errorMsg = '无法获取当前位置';
                break;
              case error.TIMEOUT:
                errorMsg = '定位超时';
                break;
              default:
                errorMsg = `定位失败，错误码: ${error.code}`;
            }
            
            console.error(errorMsg);
            
            // 定位失败时，使用默认位置（无锡市）
            const defaultPoint = new window.TMap.LatLng(31.5593, 120.2975);
            this.map.setCenter(defaultPoint);
            this.map.setZoom(12);
            
            // 存储默认位置（无锡）
            this.userLocation = defaultPoint;
            
            // 如果已经有地图标记，找到最近的标记点
            if (this.projectMarkers) {
              this.findNearestMarker();
            }
          }, {
            enableHighAccuracy: true, // 启用高精度定位
            timeout: 10000, // 超时时间10秒
            maximumAge: 0 // 不使用缓存
          });
        } else {
          console.error('浏览器不支持地理定位');
          // 浏览器不支持定位时，使用默认位置（无锡市）
          const defaultPoint = new window.TMap.LatLng(31.5593, 120.2975);
          this.map.setCenter(defaultPoint);
          this.map.setZoom(12);
          
          // 存储默认位置（无锡）
          this.userLocation = defaultPoint;
          
          // 如果已经有地图标记，找到最近的标记点
          if (this.projectMarkers) {
            this.findNearestMarker();
          }
        }
      } catch (error) {
        console.error('定位函数执行失败:', error);
        // 定位失败时，使用默认位置（无锡市）
        const defaultPoint = new window.TMap.LatLng(31.5593, 120.2975);
        this.map.setCenter(defaultPoint);
        this.map.setZoom(12);
        
        // 存储默认位置（无锡）
        this.userLocation = defaultPoint;
        
        // 如果已经有地图标记，找到最近的标记点
        if (this.projectMarkers) {
          this.findNearestMarker();
        }
      }
    }
  }
}
</script>

<style scoped>
/* 页面样式 */
.page {
  padding: 46px 0 50px;
  margin: 0;
  background-color: #fff;
  height: 100vh;
  overflow: hidden;
  box-sizing: border-box;
  position: relative;
  /* 适配iOS底部安全区域，添加constant()作为fallback，兼容微信浏览器 */
  padding-bottom: calc(50px + constant(safe-area-inset-bottom));
  padding-bottom: calc(50px + env(safe-area-inset-bottom));
}

/* 腾讯地图容器样式 */
.tencent-map {
  width: 100%;
  /* 调整高度计算，考虑顶部和底部的padding，确保地图填满剩余空间 */
  height: 100%;
  position: relative;
  z-index: 1;
}

/* 底部点位信息样式 - 相对于页面定位 */
.point-info {
  position: absolute;
  /* 适配底部安全区域，与页面padding-bottom保持一致 */
  bottom: calc(50px + constant(safe-area-inset-bottom));
  bottom: calc(50px + env(safe-area-inset-bottom));
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.98);
  padding: 12px;
  z-index: 1000; /* 确保显示在地图和其他元素上方 */
  border-radius: 16px 16px 0 0;
  padding-bottom: 16px;
  /* 限制高度，确保不遮挡底部导航栏 */
  max-height: 100px;
  overflow: hidden;
  cursor: pointer; /* 显示可点击光标 */
}

/* 左右布局容器 */
.info-content {
  display: flex;
  gap: 16px;
  align-items: center;
}

/* 图片区域 */
.info-image {
  flex-shrink: 0;
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  background: #f5f5f5;
}

/* 主图片样式 */
.main-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 文字信息区域 */
.info-text {
  flex: 1;
  min-width: 0;
}

/* 价格样式 - 与dashboard保持一致 */
.property-price {
  font-size: 13px;
  margin-bottom: 8px;
  color: #e64340;
}

.property-price .price {
  color: #e64340;
  font-weight: bold;
  font-size: 20px;
}

.info-header {
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.info-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: bold;
  color: #191B2A;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: inline;
}

.info-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  
}

.tag {
  background: #f0f0f0;
  color: #666;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
}
</style>
