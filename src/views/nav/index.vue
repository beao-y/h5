<template>
  <div class="page">
    <!-- 腾讯地图容器 -->
    <div id="tencent-map" class="tencent-map"></div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      map: null, // 地图实例
      geolocation: null, // 定位实例
      marker: null // 当前位置标记
    }
  },
  mounted() {
    // 加载腾讯地图API
    this.loadTencentMap();
  },
  methods: {
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
          center: new window.TMap.LatLng(39.915, 116.404), // 默认北京
          zoom: 15
        });
        
        // 定位到当前位置
        this.locateUser();
      } catch (error) {
        console.error('地图初始化失败:', error);
        this.showMapError();
      }
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
            
            console.log('定位成功:', point);
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
            
            // 定位失败时，使用默认位置
            const defaultPoint = new window.TMap.LatLng(39.915, 116.404);
            this.map.setCenter(defaultPoint);
            this.map.setZoom(15);
          }, {
            enableHighAccuracy: true, // 启用高精度定位
            timeout: 10000, // 超时时间10秒
            maximumAge: 0 // 不使用缓存
          });
        } else {
          console.error('浏览器不支持地理定位');
          // 浏览器不支持定位时，使用默认位置
          const defaultPoint = new window.TMap.LatLng(39.915, 116.404);
          this.map.setCenter(defaultPoint);
          this.map.setZoom(15);
        }
      } catch (error) {
        console.error('定位函数执行失败:', error);
        // 定位失败时，使用默认位置
        const defaultPoint = new window.TMap.LatLng(39.915, 116.404);
        this.map.setCenter(defaultPoint);
        this.map.setZoom(15);
      }
    }
  }
}
</script>

<style scoped>
/* 页面样式 */
.page {
  padding: 46px 0 60px;
  margin: 0;
  background-color: #fff;
  height: 100vh;
  overflow: hidden;
  box-sizing: border-box;
  position: relative;
  /* 适配iOS底部安全区域 */
  padding-bottom: calc(60px + env(safe-area-inset-bottom));
}

/* 腾讯地图容器样式 */
.tencent-map {
  width: 100%;
  /* 调整高度计算，确保地图不会超出页面内容区域 */
  height: calc(100% - 46px);
  position: relative;
  /* 移除绝对定位，改为相对定位，避免层级问题 */
  z-index: 1;
}
</style>
