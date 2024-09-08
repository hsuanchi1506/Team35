<template>
  <div class="container">
    <h1 class="title">{{ endStation }} 轉乘資訊</h1>
    <div class="favorites-container">
      <template v-if="trackInfo && trackInfo.length > 0">
        <div v-for="(item, index) in trackInfo" :key="index" class="favorite-route">
          <div class="favorite-content">
            <div class="color-block" :style="{ backgroundColor: getButtonColor(lines[0]?.lineid) }"></div>
            <p>往 {{ item.DestinationName }}</p>
            <div class="time-info">
              <template v-if="item.CountDown.includes(':')">
                {{ item.CountDown }} 後到站
              </template>
              <template v-else-if="item.CountDown == '營運時間已過'">
                營運時間已過
              </template>
              <template v-else>
                <span class="warning-text">即將進站</span>
              </template>
            </div> 
          </div>
        </div>
      </template>
      <template v-else>
        <div class="no-info-container">
          <img :src="logo" alt="Logo" class="logo" />
          <p class="no-info-message">本站無轉乘資訊</p>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import colors from '../../public/MRTinfo/mrtColors.json';
import '../css/mrtStyles.css'; // 引入你的樣式檔案
import stationsData from '../../public/MRTinfo/stations.json';
import logo from '@/assets/images/logo.svg'; // Use import for SVG
export default {
  data() {
    return {
      stationName: '',
      trackInfo: [],
      errorMessage: '',
      logo // Adjust the path to match your project structure
    };
  },
  computed: {
    endStation() {
      return this.$route.query.endStation;
    },
    endStationLine() {
      return this.$route.query.endStationLine;
    }
  },

  methods: {
    getInfo() {
      console.log("Station: ", this.endStation);
      const stationNameEncoded = encodeURIComponent(this.endStation);
      fetch(`http://localhost:3000/track-info?stationName=${stationNameEncoded}`)
        .then((response) => response.json())
        .then((data) => {
          if (data.error) {
            this.errorMessage = data.error;
            this.trackInfo = [];
          } else {
            this.trackInfo = data;
            this.errorMessage = '';
            
            const targetLineId = this.endStationLine; // 目標線路 ID，例如 "BR"
            const targetLine = stationsData.find(line => line.lineid === targetLineId);
            
            const targetStations = targetLine ? new Set(targetLine.stations.map(station => station[2])) : new Set();
            console.log("targetStations: ", targetStations);
            // 過濾掉不在目標線路中的站點
            this.trackInfo = data.filter(item => !targetStations.has(item.DestinationName));
          }
        })
        .catch((error) => {
          this.errorMessage = 'Error fetching data: ' + error;
        });
    },
    findLines() {
      if (this.endStation === '') {
        this.lines = [];
        return;
      }

      // 清空現有結果
      this.lines = [];

      // 遍歷所有路線並查找車站名稱
      stationsData.forEach((line) => {
        const stationFound = line.stations.find(
          (station) => station[2] === this.endStation
        );
        if (stationFound && line.lineid !== this.endStationLine) {
          this.lines.push({
            lineid: line.lineid,
            lineName: line.lineName
          });
        }
      });

      // 如果找不到車站，顯示無結果
      if (this.lines.length === 0) {
        console.log('No lines found for station:', this.stationName);
      }
      else {
        console.log('Lines found for station:', this.lines);
      }
    },
    getButtonColor(lineId) {
      return colors[lineId] || '#000000'; // 如果找不到顏色，預設為黑色
    },
  },
  mounted() {
    this.findLines();
    this.getInfo();
    
    // 設置定時器，每 30 秒調用 getInfo 方法
    this.intervalId = setInterval(() => {
      this.getInfo();
    }, 10000); // 10 秒更新一次
  },
  beforeDestroy() {
    // 清除定時器
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  },
  beforeRouteLeave(to, from, next) {
    // 清除定時器，確保在頁面離開時停止
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    next();
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
.no-info-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 60vh;
  margin: 0; /* Ensure no extra margin */
  padding: 0; /* Ensure no extra padding */
  overflow: hidden; /* Prevent overflow */
}

.logo {
  width: 100px; /* Adjust the width of the logo */
  height: auto; /* Maintain aspect ratio */
  margin-bottom: 16px; /* Space between the logo and the text */
}

.no-info-message {
  font-size: 24px;
  font-weight: bold;
  color: #6B7280; /* Same color as the title 'text-grey-500' */
  text-align: center;
}

.error {
  color: red;
}

.warning-text {
  color: red;
}
</style>
