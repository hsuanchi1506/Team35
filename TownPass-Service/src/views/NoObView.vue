<template>
  <div class="container">
    <h1 class="title">{{ this.stationName }}無障礙資訊</h1>

    <!-- 站點資訊顯示 -->
    <div v-if="stationInfo" class="info-card">
      <div class="info-block elevator-info">
        <strong>出口電梯/無障礙坡道位置</strong>
        <p>{{ stationInfo['出口電梯/無障礙坡道位置'] }}</p>
      </div>

      <div class="info-block gate-info">
        <strong>無障礙閘門位置</strong>
        <p>{{ stationInfo.無障礙閘門位置 }}</p>
      </div>

      <div class="info-block restroom-info">
        <strong>無障礙廁所位置</strong>
        <p>{{ stationInfo.無障礙廁所位置 }}</p>
      </div>

      <div class="info-block door-direction-info">
        <strong>列車門開方向</strong>
        <p>{{ stationInfo.列車門開方向 }}</p>
      </div>

      <div class="info-block wheelchair-info">
        <strong>車廂輪椅優先停靠區</strong>
        <p>{{ stationInfo.車廂輪椅優先停靠區 }}</p>
      </div>
    </div>

    <!-- 錯誤訊息顯示 -->
    <div v-if="errorMessage" class="error-message">
      <p>{{ errorMessage }}</p>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      stationName: '',
      stationData: null,
      stationInfo: null,
      errorMessage: ''
    };
  },
  methods: {
    async fetchStationInfo() {
      this.stationInfo = null;
      this.errorMessage = '';

      try {
        const response = await fetch('../../public/station_data.json');
        if (!response.ok) throw new Error('Failed to fetch station data');
        
        this.stationName = this.$route.query.endStation;
        this.stationData = await response.json();

        const station = this.stationData.find(
          (item) => item.車站名稱 === this.stationName.trim()
        );

        if (station) {
          this.stationInfo = station;
        } else {
          this.errorMessage = '找不到該車站資訊，請重新輸入。';
        }
      } catch (error) {
        console.error('Error fetching station data:', error);
        this.errorMessage = '無法讀取資料，請稍後再試。';
      }
    }
  },
  mounted() {
    this.fetchStationInfo();
  }
};
</script>

<style scoped>
.container {
  min-height: 100vh;
  max-width: 100%;
  padding: 15px;
  background-color: #f0f0f0;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.title {
  font-size: 1.8rem;
  text-align: center;
  margin-bottom: 20px;
  color: #2db6c7;
}

.info-card {
  padding: 15px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  margin-top: 20px;
}

/* 單獨區塊樣式 */
.info-block {
  padding: 10px 0;
  border-bottom: 1px solid #e0e0e0;
}

.info-block:last-child {
  border-bottom: none;
}

.info-block strong {
   
  color: bg-primary-700; /* 深藍色 */
}

.info-block p {
  color: #5b5b5b; /* 灰色 */
  margin: 5px 0;
}

.error-message {
  color: red;
  text-align: center;
  font-weight: bold;
}
</style>
