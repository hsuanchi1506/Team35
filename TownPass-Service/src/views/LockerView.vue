<template>
  <div class="container">
    <!-- <div id="stationInfo">
      <h1 class="title" v-if="stationName">{{ stationName }}置物櫃</h1>
    </div> -->
    <h1 class="title">{{ stationName }}置物櫃</h1>
    <div id="result" style="margin-top: 20px;">
      <div v-if="lockerData.length > 0" id="resultList">
        <div v-for="item in lockerData" :key="item.StationName + item.Size" class="locker-item">
          <table>
            <tbody>
              <tr>
                <th>置物櫃大小</th>
                <td>{{ item.Size }}</td>
              </tr>
              <tr>
                <th>位置</th>
                <td>{{ item.LockerDescription }}</td>
              </tr>
              <tr>
                <th>費率</th>
                <td>{{ item.payment }}</td>
              </tr>
              <tr>
                <th>剩餘可用數目</th>
                <td>{{ item.QuantityAvailable }}</td>
              </tr>
              <tr>
                <th>總數目</th>
                <td>{{ item.Total }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>



<script>
export default {
  data() {
    return {
      stationName: '', // Store the station name
      lockerData: []
    };
  },
  methods: {
    async getLockerInfo() {
      try {
        this.stationName = this.$route.query.endStation; // Station name is obtained from the query params
        const response = await fetch(
          `http://localhost:3001/track-info?stationName=${encodeURIComponent(this.stationName)}`
        );
        const data = await response.json();

        const jsonData = JSON.parse(data.split('<?xml')[0]);
        this.lockerData = jsonData;
      } catch (error) {
        console.error(`Error: ${error.message}`);
      }
    }
  },
  mounted() {
    this.getLockerInfo();
  }
};
</script>


<style scoped>
body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #f0f4f8;
  color: #333;
}

.container {
  min-height: 100vh;
  max-width: 100%;
  padding: 15px;
  background-color: #f0f0f0;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

#stationInfo {
  display: flex;
  justify-content: center; /* Align center */
  padding: 10px;
}

.title {
  font-size: 1.8rem;
  text-align: center;
  margin-bottom: 20px;
  color: #2db6c7;
}

#result {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  margin-left: 30px;
  margin-right: 30px;
  padding: 1;
}

.locker-item {
  background-color: #fff;
  border-radius: 8px;
  width: 100%; /* 讓它根據父容器寬度調整 */
  margin-bottom: 20px;
  
  overflow: hidden;
  box-sizing: border-box;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  /* max-width: 800px; 移除這行 */
}

.locker-item table {
  width: 100%;
  border-collapse: collapse;
}

.locker-item th,
.locker-item td {
  padding: 8px;
  text-align: center;
}

.locker-item th {
  background-color: #2db6c7;
  color: #fff;
  width: 40%;
}

.locker-item td {
  border-bottom: 1px solid #ddd;
  width: 60%;
}

.locker-item tr:last-child td {
  border-bottom: none;
}

@media (max-width: 768px) {
  .locker-item th,
  .locker-item td {
    padding: 10px;
  }

  .title {
    font-size: 2em; /* Adjusted for smaller screens */
  }
}

@media (max-width: 500px) {
  .locker-item th,
  .locker-item td {
    padding: 8px;
  }

  .title {
    font-size: 1.8em; /* Adjusted for even smaller screens */
  }
}
</style>
