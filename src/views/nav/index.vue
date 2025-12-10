<template>
  <div class="page">
    <!-- 百度地图容器 -->
    <div id="baidu-map" class="baidu-map"></div>
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
    // 加载百度地图API
    this.loadBaiduMap();
  },
  methods: {
    // 加载百度地图API
    loadBaiduMap() {
      // 检查百度地图API是否已经加载
      if (window.BMap) {
        this.initMap();
      } else {
        // 动态加载百度地图API
        const script = document.createElement('script');
        script.type = 'text/javascript';
        
        // 使用正确的API版本和ak处理
        // 有效百度地图AK
        const ak = '46A9wHE8r42pyTGOU3U1KftocFSkj42w';
        script.src = `https://api.map.baidu.com/api?v=3.0&ak=${ak}&callback=initBaiduMap`;
        
        // 添加加载失败处理
        script.onerror = () => {
          console.error('百度地图API加载失败，请检查AK是否正确');
          this.showMapError();
        };
        
        document.body.appendChild(script);
        
        // 定义回调函数
        window.initBaiduMap = () => {
          // 检查BMap是否成功加载
          if (window.BMap) {
            this.initMap();
          } else {
            console.error('百度地图API加载失败，BMap对象未定义');
            this.showMapError();
          }
        };
      }
    },
    
    // 显示地图加载错误
    showMapError() {
      const mapContainer = document.getElementById('baidu-map');
      if (mapContainer) {
        mapContainer.innerHTML = `
          <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; text-align: center; padding: 20px;">
            <h3 style="color: #ff4444; margin-bottom: 10px;">地图加载失败</h3>
            <p style="color: #666; margin-bottom: 20px;">请检查百度地图AK是否正确配置</p>
            <a href="http://lbsyun.baidu.com/apiconsole/key" target="_blank" style="color: #1989fa; text-decoration: underline;">
              前往百度地图开放平台申请AK
            </a>
          </div>
        `;
      }
    },
    
    // 初始化地图
    initMap() {
      try {
        // 创建地图实例
        this.map = new window.BMap.Map('baidu-map');
        
        // 设置地图中心点（默认北京）
        const point = new window.BMap.Point(116.404, 39.915);
        this.map.centerAndZoom(point, 15);
        
        // 启用地图控件
        this.map.enableScrollWheelZoom(true); // 启用滚轮缩放
        this.map.enableContinuousZoom(true); // 启用连续缩放
        
        // 添加地图控件
        this.map.addControl(new window.BMap.NavigationControl()); // 平移缩放控件
        this.map.addControl(new window.BMap.ScaleControl()); // 比例尺控件
        this.map.addControl(new window.BMap.OverviewMapControl()); // 缩略地图控件
        this.map.addControl(new window.BMap.MapTypeControl()); // 地图类型控件
        
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
        // 创建定位实例
        this.geolocation = new window.BMap.Geolocation();
        
        // 获取当前位置
        this.geolocation.getCurrentPosition((position) => {
          if (this.geolocation.getStatus() === window.BMAP_STATUS_SUCCESS) {
            // 获取定位结果
            const point = position.point;
            
            // 清除旧标记
            if (this.marker) {
              this.map.removeOverlay(this.marker);
            }
            
            // 创建新标记
            this.marker = new window.BMap.Marker(point);
            this.map.addOverlay(this.marker);
            
            // 中心点移动到当前位置
            this.map.centerAndZoom(point, 17);
            
            // 添加信息窗口
            const infoWindow = new window.BMap.InfoWindow('您当前的位置');
            this.marker.addEventListener('click', () => {
              this.map.openInfoWindow(infoWindow, point);
            });
            
            console.log('定位成功:', point);
          } else {
            // 定位失败时的处理
            const status = this.geolocation.getStatus();
            let errorMsg = '定位失败';
            
            // 根据状态码显示具体错误信息
            switch (status) {
              case window.BMAP_STATUS_UNKNOWN_LOCATION:
                errorMsg = '无法获取当前位置';
                break;
              case window.BMAP_STATUS_PERMISSION_DENIED:
                errorMsg = '定位权限被拒绝';
                break;
              case window.BMAP_STATUS_TIMEOUT:
                errorMsg = '定位超时';
                break;
              case window.BMAP_STATUS_INVALID_KEY:
                errorMsg = 'AK无效';
                break;
              case window.BMAP_STATUS_INVALID_REQUEST:
                errorMsg = '无效的请求';
                break;
              default:
                errorMsg = `定位失败，错误码: ${status}`;
            }
            
            console.error(errorMsg);
            
            // 定位失败时，使用默认位置
            const defaultPoint = new window.BMap.Point(116.404, 39.915);
            this.map.centerAndZoom(defaultPoint, 15);
          }
        }, {
          enableHighAccuracy: true, // 启用高精度定位
          maximumAge: 0, // 不使用缓存
          timeout: 10000 // 超时时间10秒
        });
      } catch (error) {
        console.error('定位函数执行失败:', error);
        // 定位失败时，使用默认位置
        const defaultPoint = new window.BMap.Point(116.404, 39.915);
        this.map.centerAndZoom(defaultPoint, 15);
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
}

/* 百度地图容器样式 */
.baidu-map {
  width: 100%;
  height: calc(100% - 46px - 50px);
  position: absolute;
  top: 46px;
  left: 0;
  right: 0;
  bottom: 50px;
}
</style>