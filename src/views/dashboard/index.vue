<template>
  <div class="page" @scroll="handleScroll" ref="pageScroll">
    <div class="content" v-if="Object.keys(info).length !== 0">
    <!-- 顶部 Banner 区域 -->
    <van-swipe :autoplay="3000" indicator-color="#fff">
      <van-swipe-item>
        <img :src="info.TopBannerImageUrl" alt="Banner" class="banner-img" />
      </van-swipe-item>
    </van-swipe>

    <!-- 促销卡片 -->
    <div class="promo-card"  v-if="Object.keys(info).length !== 0">
      <div class="promo-title">{{info.BannerTitle}}</div>
      <div class="promo-desc">{{info.BuildingAreaDesc}}</div>
      <div class="promo-contact">
        <div class="contact-item">
          <span class="contact-label">写字楼招商业招商热线：</span>
          <span class="contact-phone">{{info.MainHotline}}</span>
        </div>
        <div class="contact-item">
          <span class="contact-label">海創·共享办公招商热线：</span>
          <span class="contact-phone">{{info.ShareOfficeHotline}}</span>
        </div>
      </div>
    </div>

    <!-- 楼盘鉴赏标题 -->
    <div class="section-title" v-if="propertyList.length">楼盘鉴赏</div>

    <!-- 楼盘列表 -->
    <div class="property-list">
      <div class="property-item" v-for="(item, index) in propertyList" :key="index" @click="handleClick(item)">
        <div class="property-type">{{ item.PropertyType }}</div>
        <img :src="item.ImagesUrl" alt="" class="property-img" />
        <div class="property-price">约 <span class="price">{{ item.Price }}</span> 元/㎡</div>
        <div class="property-name">{{ item.ProjectName }}</div>
        <div class="property-address">{{ item.Address }}</div>
        <div class="property-tags">
          <span class="tag" >{{item.PreSalePermit}}</span>
          <span class="tags-container">
            <span v-for="(tag, tagIndex) in item.Tags" :key="tagIndex">
              <span class="tag-text">{{ tag }}</span>
              <span class="tag-slash" v-if="tagIndex < item.Tags.length - 1"> / </span>
            </span>
          </span>
        </div>
      </div>
    </div>

    <!-- 加载状态 -->
    <div class="loading-container">
      <van-loading v-if="loading" type="spinner" color="#B1B2B1" size="16" />
      <span v-else-if="finished" class="finished-text">到底了</span>
    </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      // 分页数据
      propertyList: [],
      page: 1,
      pageSize: 10,
      loading: false,
      finished: false,
      info: {}
    };
  },
  mounted() {
    // 初始化加载数据
    this.loadData();
    this.getInfo();
  },
  methods: {
    getInfo(){
      axios.post(`${process.env.VUE_APP_BASE_API}/system/new/index`, null, {
        params: {
          pageIndex: 1,
          pageSize: 1
        }
      }).then((response) => {
        const data = response.data || {};
        
        this.info ={
          ...data.list[0] || {},
          TopBannerImageUrl: `${process.env.VUE_APP_BASE_API}${data.list[0].TopBannerImageUrl}`
        }
      })
    },
    // 加载数据
    loadData() {
      if (this.loading || this.finished) return;
      
      this.loading = true;
      
      // 直接使用 axios 发送请求，post请求通过query传递参数
      axios.post(`${process.env.VUE_APP_BASE_API}/system/newdetial/index`, null, {
        params: {
          pageIndex: this.page,
          pageSize: this.pageSize
        }
      }).then((response) => {
        // 处理接口返回的数据
        const data = response.data || [];
        
  
        
        // 格式化数据，为图片路径拼接上VUE_APP_BASE_API前缀
        const formattedList = data.list.map(item => ({
          ...item,
          Tags: item.Tags.split('/'),
          ImagesUrl: `${process.env.VUE_APP_BASE_API}${item.MainImageUrl.split(',').shift().trim()}`
        }));
        
        if (this.page === 1) {
          this.propertyList = formattedList;
        } else {
          this.propertyList = [...this.propertyList, ...formattedList];
        }
        
        // 判断是否加载完所有数据
        if (this.propertyList.length >= data.count) {
          this.finished = true;
        }
        
        this.loading = false;
        this.page++;
      }).catch((error) => {
        console.error('加载数据失败:', error);
        this.loading = false;
        
          this.finished = true;
        
      });
    },
    // 滚动监听
    handleScroll() {
      const scrollTop = this.$refs.pageScroll.scrollTop;
      const scrollHeight = this.$refs.pageScroll.scrollHeight;
      const clientHeight = this.$refs.pageScroll.clientHeight;
      const distanceToBottom = scrollHeight - scrollTop - clientHeight;
      
      // 触底加载
      if (distanceToBottom < 100 && !this.loading && !this.finished) {
       
        this.loadData();
      }
    },
    // 点击楼盘项
    handleClick(item) {
      // 跳转详情页
      this.$router.push({
        name: 'Detail',
        params: {
          id: item.Id
        }
      });
    }
  }
};
</script>

<style scoped>
.page {
  padding-top: 46px;
  padding-bottom: 60px;
  background-color: #fff;
  height: 100vh;
  overflow-y: auto;
  box-sizing: border-box;
}

.content {
  padding: 12px;
}



/* Banner 样式 */
.van-swipe {
  width: 100%;
  aspect-ratio: 6/3; /* 4:3 宽高比 */
  overflow: hidden;
  margin-bottom: 10px;
  border-radius: 10px;
}

.van-swipe-item {
  width: 100%;
  height: 100%;
}

.banner-img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
}

/* 促销卡片样式 */
.promo-card {
  background-color: #4D4E65;
  background-image: url('./../../assets/img/home-bg.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  color: white;
  padding: 20px 15px;
  margin: 0;
  border-radius: 10px;
  overflow: hidden;
}

.promo-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 10px;
  color: #C1AC98;
}

.promo-desc {
  font-size: 14px;
  margin-bottom: 15px;
  line-height: 1.5;
  color: #ADAEC4;
}

.promo-contact {
  font-size: 14px;
}

.contact-item {
  margin-bottom: 5px;
  display: flex;
  align-items: center;
}

.contact-label {
  font-size: 12px;
  opacity: 0.8;
  margin-right: 5px;
  color: #ADAEC4;
}

.contact-phone {
  font-weight: bold;
  font-size: 16px;
  color: #C1AC98;
}

/* 章节标题样式 */
.section-title {
  font-size: 20px;
  font-weight: bold;
  padding: 15px 0;
  margin-top: 10px;
  color: #191B2B;
}

/* 楼盘项样式 */
.property-item {
  background-color: white;
  margin-bottom: 10px;
  padding-bottom: 15px;
  position: relative;
  overflow: hidden;
}

.property-type {
  font-size: 14px;
  color: #B6A37E;
  background-color: rgba(0, 0, 0, 0.72);
  padding: 5px 10px;
  position: absolute;
  left: 0;
  top: 0;
  z-index: 1;
  border-radius: 10px 0 10px 0;
}

.property-img {
  width: 100%;
  height: 220px;
  display: block;
  margin: 0  0 10px 0;
  border-radius: 10px;
  object-fit: cover;
}

.property-price {
  font-size: 13px;
  margin: 10px 0;
  color: #e64340;
}

.price {
  color: #e64340;
  font-weight: bold;
  font-size: 20px;
}

.property-name {
  font-size: 16px;
  font-weight: bold;
  margin: 14px 0 10px 0;
  color: #191B2A;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.property-address {
  font-size: 14px;
  color: #A5A7B5;
  margin-bottom: 14px;
}

.property-tags {
  display: flex;
  flex-wrap: wrap;
  color: #95886F;
  align-items: center;
}

.tag {
  font-size: 13px;
  line-height: 13px;
  color: #95886F;
  background-color: #F3EDE2;
  padding: 4px 12px;
  border-radius: 12px;
  margin-right: 8px;
}

.tags-container {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  line-height: 14px;
}

.tag-text {
  font-size: 13px;
  color: #95886F;
  margin-bottom: 8px;
}

.tag-slash {
  font-size: 13px;
  color: #95886F;
  margin: 0 4px;
}

/* 列表容器 */
.property-list {
  background-color: #fff;
}

/* 加载状态容器 */
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  background-color: #fff;
}

/* 到底了文字 */
.finished-text {
  font-size: 14px;
  color: #999;
}
</style>
