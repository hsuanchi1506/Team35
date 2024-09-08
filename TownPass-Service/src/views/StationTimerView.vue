<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import { useFormStore } from '@/stores/form';
import { useUserStore } from '@/stores/user';
import { storeToRefs } from 'pinia';
import { useConnectionMessage } from '@/composables/useConnectionMessage';
import { useHandleConnectionData } from '@/composables/useHandleConnectionData';
import ServiceTabsView from '@/components/organisms/ServiceTabsView.vue';
import BaseInput from '@/components/atoms/BaseInput.vue';
import MRTroutes from '../../public/MRTinfo/stations.json';
import runningTime from '../../public/MRTinfo/running_time.json';
import type { User } from '@/stores/user';
import BaseDialog from '@/components/atoms/BaseDialog.vue';
import BaseButton from '@/components/atoms/BaseButton.vue';
import colors from '../../public/MRTinfo/mrtColors.json';
import '../css/mrtStyles.css'; // 引入你的樣式檔案

const store = useFormStore();

store.reset();

const userStore = useUserStore();

const { user } = storeToRefs(userStore);

const handleUserInfo = (event: { data: string }) => {
  const result: { name: string; data: User } = JSON.parse(event.data);

  user.value = result.data;
};

useConnectionMessage('userinfo', null);

useHandleConnectionData(handleUserInfo);

const route = useRoute();

const activeTab = ref(0);

if (route.query.isSearch) {
  activeTab.value = 1;
}

import { useRouter } from 'vue-router';

const arrivalDialogOpen = ref(false);
const isSettingAlarm = ref(false);

// 彈出視窗的顯示狀態
const showPopup = ref(false);

// 使用路由
const router = useRouter();

const onArrivalClick = () => {
  showPopup.value = false;
  router.push({
    path: '/arrival',
    query: { endStationLine: endStation.value?.line, endStation: endStation.value?.name, stationid: endStation.value?.code }
  }); // 將 '目標頁面' 替換成你想跳轉的頁面路徑
};

const onRemoveClick = () => {
  isSettingAlarm.value = false;
  countdownTime.value = travelTime.value - 50;
};

const calculateTravelTime = (start: Station | null, end: Station | null): number | null => {
  if (!start || !end || !selectedLine.value) {
    return null;
  }
  var stationsBetween;
  if (selectedDirection.value === 'forward') {
    stationsBetween = getStationsBetween(start, end);
  } else {
    stationsBetween = getStationsBetween(end, start);
  }
  console.log('stationsBetween: ', stationsBetween);
  let totalTime = 0;

  for (let i = 0; i < stationsBetween.length - 1; i++) {
    const currentStation = stationsBetween[i];
    const nextStation = stationsBetween[i + 1];

    // 查找當前站與下一站之間的行車時間
    const travelTimeEntry = runningTime.find((time) =>
      time.TravelTimes.some(
        (travelTime) =>
          (travelTime.FromStationID === currentStation.code &&
            travelTime.ToStationID === nextStation.code) ||
          (travelTime.FromStationID === nextStation.code &&
            travelTime.ToStationID === currentStation.code)
      )
    );

    if (travelTimeEntry) {
      const matchedTime = travelTimeEntry.TravelTimes.find(
        (travelTime) =>
          (travelTime.FromStationID === currentStation.code &&
            travelTime.ToStationID === nextStation.code) ||
          (travelTime.FromStationID === nextStation.code &&
            travelTime.ToStationID === currentStation.code)
      );

      if (matchedTime) {
        totalTime += matchedTime.RunTime;
        if (selectedDirection.value === 'forward' && i < stationsBetween.length - 2) {
          totalTime += matchedTime.StopTime;
        } else if (selectedDirection.value === 'backward' && i > 0) {
          totalTime += matchedTime.StopTime;
        }
      }
    }
  }

  return totalTime;
};

interface Station {
  id: number;
  code: string;
  name: string;
  line: string;
}

interface MRTLine {
  lineid: string;
  lineName: string;
  stations: Station[];
}

const favoriteRoutes = ref<{ start: Station | null; end: Station | null; line: MRTLine | null }[]>(
  []
);

const loadFavoriteRoutes = () => {
  favoriteRoutes.value = store.favoriteRoutes || [];
};
loadFavoriteRoutes();

// const addFavoriteRoute = () => {
//   if (startStation.value && endStation.value && selectedLine.value) {
//     // Ensure line is selected
//     favoriteRoutes.value.push({
//       start: startStation.value,
//       end: endStation.value,
//       line: selectedLine.value // Add the line value
//     });
//     store.favoriteRoutes = [...favoriteRoutes.value]; // Save to store
//     // startStation.value = null;
//     // endStation.value = null;
//     // selectedLine.value = null; // Reset the line selection after adding
//   }
// };

const addFavoriteRoute = () => {
  if (startStation.value && endStation.value && selectedLine.value) {
    // 檢查這條路線是否已經在收藏中
    const isAlreadyAdded = favoriteRoutes.value.some(
      (route) =>
        route.start?.code === startStation.value?.code &&
        route.end?.code === endStation.value?.code &&
        route.line?.lineid === selectedLine.value?.lineid
    );

    if (!isAlreadyAdded) {
      // 如果不存在，則加入收藏
      favoriteRoutes.value.push({
        start: startStation.value,
        end: endStation.value,
        line: selectedLine.value // Add the line value
      });
      store.favoriteRoutes = [...favoriteRoutes.value]; // Save to store
    } else {
      console.log('該路線已經存在於收藏中');
    }
  }
};

const removeFavoriteRoute = (index: number) => {
  favoriteRoutes.value.splice(index, 1);
};

const handleTabChange = (index: number) => {
  activeTab.value = index;
};

// 初始化 selectedLine，給它一個合理的初始值（例如空的 MRTLine）
// const selectedLine: Ref<MRTLine | null> = ref(null);
const selectedLine = ref<MRTLine | null>(null);

const selectedStationType = ref<'start' | 'end'>('start');
const startStation = ref<Station | null>(null);
const endStation = ref<Station | null>(null);
const countdownTime = ref(0);

// 監聽起點站和終點站的變化並計算行車時間
// 計算 travelTime 的值，處理 null 值
const travelTime = computed(() => {
  const result = calculateTravelTime(startStation.value, endStation.value);
  // 如果 result 是 null，則返回 0
  return result ?? 0;
});

watch(travelTime, (newTravelTime) => {
  countdownTime.value = newTravelTime - 50;
});

const travelTimeFormatted = computed(() => {
  const timeInSeconds = countdownTime.value;

  if (timeInSeconds === null) {
    return null;
  }

  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = timeInSeconds % 60;

  return `${minutes}分${seconds}秒`;
});

// 在 tab2 的 JS 開始處，新增一個方向選擇變數
const selectedDirection = ref<'forward' | 'backward'>('forward');

watch(selectedDirection, (newDirection) => {
  startStation.value = null;
  endStation.value = null;
  selectedStationType.value = 'start';
});

watch(selectedLine, (newLine) => {
  startStation.value = null;
  endStation.value = null;
  selectedStationType.value = 'start';
});

const onStationSelected = (station: Station) => {
  const list1 = ['蘆洲站', '三民高中站', '徐匯中學站', '三和國中站', '三重國小站'];
  const list2 = [
    '迴龍站',
    '丹鳳站',
    '輔大站',
    '新莊站',
    '頭前庄站',
    '先嗇宮站',
    '三重站',
    '菜寮站',
    '台北橋站'
  ];
  if (selectedStationType.value === 'start') {
    // 選擇起點站時，檢查終點是否在起點之後
    if (endStation.value) {
      const startIndex = getStationsForDirection(
        selectedLine.value,
        selectedDirection.value
      ).findIndex((s) => s.code === station.code);
      const endIndex = getStationsForDirection(
        selectedLine.value,
        selectedDirection.value
      ).findIndex((s) => s.code === endStation.value.code);

      if (startIndex >= endIndex) {
        // alert('起點不能在終點後面。請重新選擇起點站。');
        return;
      }
      if (
        (list1.includes(station.name) && list2.includes(endStation.value.name)) ||
        (list2.includes(station.name) && list1.includes(endStation.value.name))
      ) {
        return;
      }
      if (
        (list1.includes(station.name) && list2.includes(endStation.value.name)) ||
        (list2.includes(station.name) && list1.includes(endStation.value.name))
      ) {
        return;
      }
    }
    startStation.value = station;
  } else if (selectedStationType.value === 'end') {
    // 選擇終點站時，檢查起點是否在終點之前
    if (startStation.value && selectedLine.value) {
      const startIndex = getStationsForDirection(
        selectedLine.value,
        selectedDirection.value
      ).findIndex((s) => s.code === startStation.value?.code);
      const endIndex = getStationsForDirection(
        selectedLine.value,
        selectedDirection.value
      ).findIndex((s) => s.code === station.code);

      if (startIndex >= endIndex) {
        // alert('終點不能在起點之前。請重新選擇終點站。');
        return;
      }
      if (
        (list1.includes(startStation.value.name) && list2.includes(station.name)) ||
        (list2.includes(startStation.value.name) && list1.includes(station.name))
      ) {
        return;
      }
      if (
        (list1.includes(startStation.value.name) && list2.includes(station.name)) ||
        (list2.includes(startStation.value.name) && list1.includes(station.name))
      ) {
        return;
      }
    }
    endStation.value = station;
  }
};

const noNeedStation = (station: Station) => {
  const list1 = ['蘆洲站', '三民高中站', '徐匯中學站', '三和國中站', '三重國小站'];
  const list2 = [
    '迴龍站',
    '丹鳳站',
    '輔大站',
    '新莊站',
    '頭前庄站',
    '先嗇宮站',
    '三重站',
    '菜寮站',
    '台北橋站'
  ];
  // if (selectedStationType.value === 'start') 
    // 選擇起點站時，檢查終點是否在起點之後
    if (endStation.value) {
      const startIndex = getStationsForDirection(
        selectedLine.value,
        selectedDirection.value
      ).findIndex((s) => s.code === station.code);
      const endIndex = getStationsForDirection(
        selectedLine.value,
        selectedDirection.value
      ).findIndex((s) => s.code === endStation.value.code);

      if (startIndex > endIndex) {
        // alert('起點不能在終點後面。請重新選擇起點站。');
        return true;
      }
      if (
        (list1.includes(station.name) && list2.includes(endStation.value.name)) ||
        (list2.includes(station.name) && list1.includes(endStation.value.name))
      ) {
        return true;
      }
    }
  //   return false;
  // } else if (selectedStationType.value === 'end') {
    // 選擇終點站時，檢查起點是否在終點之前
    if (startStation.value && selectedLine.value) {
      const startIndex = getStationsForDirection(
        selectedLine.value,
        selectedDirection.value
      ).findIndex((s) => s.code === startStation.value?.code);
      const endIndex = getStationsForDirection(
        selectedLine.value,
        selectedDirection.value
      ).findIndex((s) => s.code === station.code);

      if (startIndex > endIndex) {
        // alert('終點不能在起點之前。請重新選擇終點站。');
        return true;
      }
      if (
        (list1.includes(startStation.value.name) && list2.includes(station.name)) ||
        (list2.includes(startStation.value.name) && list1.includes(station.name))
      ) {
        return true;
      }
    }
    return false;
  // }
};

const convertedMRTroutes = MRTroutes.map((line) => ({
  ...line,
  stations: line.stations.map((station) => ({
    id: station[0] as number,
    code: station[1] as string,
    name: station[2] as string,
    line: station[3] as string
  }))
}));

const getStationsBetween = (start: Station | null, end: Station | null): Station[] => {
  if (!start || !end || !selectedLine.value) {
    return [];
  }

  const stations = selectedLine.value.stations;
  const startIndex = stations.findIndex((station) => station.code === start.code);
  const endIndex = stations.findIndex((station) => station.code === end.code);

  if (startIndex === -1 || endIndex === -1) {
    return [];
  }

  if (startIndex < endIndex) {
    // 正向：從起點到終點
    return stations.slice(startIndex, endIndex + 1);
  } else {
    // 反向：從終點到起點
    return stations.slice(endIndex, startIndex + 1).reverse();
  }
};

const onRouteSelect = (line: MRTLine) => {
  selectedLine.value = line;
  console.log('Selected line:', line); // 檢查這裡是否有正確的路線資料
  console.log('Selected line stations:', line.stations); // 檢查站點資料
};

const getButtonColor = (lineid: string) => {
  return colors[lineid as keyof typeof colors] || '#000000';
};

const setFavoriteTimer = (route: { start: Station | null; end: Station | null }) => {
  if (route.start && route.end) {
    startStation.value = route.start;
    endStation.value = route.end;
    startCountdown(); // Start the countdown when a favorite route is selected
  }
};

const showAlert = ref(false);
const countdown = ref(10); // 15分鐘的倒數計時（900秒）

let interval: number | undefined;

// const startCountdown = () => {
//   showAlert.value = false;
//   isSettingAlarm.value = true;
//   countdownTime.value = travelTime.value - 30;
  
//   interval = setInterval(() => {
//     countdownTime.value--;
//     if (countdownTime.value <= 0) { // 更正為 countdownTime.value
//       clearInterval(interval);
//       isSettingAlarm.value = false;
//       arrivalDialogOpen.value = true;
//       countdownTime.value = travelTime.value - 30;
//       sendMessage();
//     }
//   }, 1000);
// };
let startTime = null;
const startCountdown = () => {
  isSettingAlarm.value = true;
  startTime = Date.now();
  const targetTime = startTime + (countdownTime.value) * 1000; // 設定目標時間

  interval = setInterval(() => {
    const currentTime = Date.now();
    countdownTime.value = Math.floor((targetTime - currentTime) / 1000); // 計算剩餘秒數
    if (!isSettingAlarm.value) {
      countdownTime.value = travelTime.value - 50;
      clearInterval(interval);
      return;
    }
    if (countdownTime.value <= 0) {
      isSettingAlarm.value = false;
      countdownTime.value = travelTime.value - 50;
      arrivalDialogOpen.value = true;
      clearInterval(interval);
      sendMessage();
    }
  }, 1000);
};

const sendMessage = () => {
  const message = JSON.stringify({
    name: 'notify',
    data: `{
        "title": "即將到站",
        "body": "點擊以查看更多到站資訊"
    }`
    // data: `\"{
    //   \"title\": \"Notification Title\",
    //   \"body\": \"This is a notification body\"
    // }\"`
  });

  console.log('Sending message to Flutter:', message);
  // Use postMessage to send data to Flutter
  flutterObject.postMessage(message);
};

// 根據方向選擇顯示不同的站點
const getStationsForDirection = (line: MRTLine, direction: 'forward' | 'backward') => {
  return direction === 'forward' ? line.stations : [...line.stations].reverse();
};

const getFirstAndLastStation = computed(() => {
  if (!selectedLine.value) {
    return { first: null, last: null };
  }

  const stations = getStationsForDirection(selectedLine.value, selectedDirection.value);

  return {
    first: stations[0] || null,
    last: stations[stations.length - 1] || null
  };
});
</script>

<template>
  <main>
    <ServiceTabsView v-model="activeTab">
      <template #tab0>
        <div class="page-container">
          <!-- 固定在頁面頂部的區塊 -->
          <section class="top-section">
            <!-- 彈出視窗按鈕 -->
            <!-- <div class="flex justify-center -mx-4 py-4 shadow-[0_0_6px_0_rgba(0,0,0,0.1)] mt-3">
              <BaseButton class="w-3/4" @click="arrivalDialogOpen = true">顯示詳細資訊</BaseButton>
            </div> -->
            <p class="text-grey-500 mt-4 mb-2 px-4">請選擇路線</p>
            <div class="route-buttons-container">
              <button
                v-for="line in convertedMRTroutes"
                :key="line.lineid"
                class="route-button"
                :class="{ 'selected-route': selectedLine?.lineid === line.lineid }"
                @click="onRouteSelect(line)"
                :style="{
                  borderColor: getButtonColor(line.lineid),
                  backgroundColor:
                    selectedLine?.lineid === line.lineid
                      ? getButtonColor(line.lineid)
                      : 'transparent'
                }"
              >
                {{ line.lineName }}
              </button>
            </div>
          </section>

          <!-- 主內容區域 -->
          <div class="content">
            <!-- 動態顯示選取路線的所有站點 -->
            <section v-if="selectedLine" class="stations-buttons-container">
              <!-- 選擇方向 -->
              <div class="flex items-center justify-center my-2">
                <label
                  class="radio-label"
                  data-value="forward"
                  :class="{ 'direction-active': selectedDirection === 'forward' }"
                >
                  <input type="radio" v-model="selectedDirection" value="forward" />
                  {{
                    selectedLine.stations[0].name +
                    ' &rArr; ' +
                    selectedLine.stations[selectedLine.stations.length - 1].name
                  }}
                </label>
                <label
                  class="radio-label"
                  data-value="backward"
                  :class="{ 'direction-active': selectedDirection === 'backward' }"
                >
                  <input type="radio" v-model="selectedDirection" value="backward" />
                  {{
                    selectedLine.stations[selectedLine.stations.length - 1].name +
                    ' &rArr; ' +
                    selectedLine.stations[0].name
                  }}
                </label>
              </div>
              <div class="flex items-center justify-center my-2">
                <label
                  class="radio-label"
                  :class="{ 'start-active': selectedStationType === 'start' }"
                >
                  <input type="radio" v-model="selectedStationType" value="start" />
                  選取起點站
                </label>
                <label class="radio-label" :class="{ 'end-active': selectedStationType === 'end' }">
                  <input type="radio" v-model="selectedStationType" value="end" />
                  選取終點站
                </label>
              </div>

              <!-- 顯示選取的起點和終點 -->
              <p class="text-grey-500 mt-4 mb-2 px-4">{{ selectedLine.lineName }}的站點</p>
              <div class="stations-buttons">
                <button
                  v-for="station in getStationsForDirection(selectedLine, selectedDirection)"
                  :key="station.code"
                  class="station-button"
                  @click="onStationSelected(station)"
                  :class="{
                    'start-selected': startStation?.code === station.code,
                    'end-selected': endStation?.code === station.code,
                    'middle-station': getStationsBetween(startStation, endStation).some(
                      (s) => s.code === station.code
                    ),
                    'no-need-station': noNeedStation(station)
                  }"
                  :style="{ borderColor: getButtonColor(station.line), color: 'black' }"
                >
                  {{ station.code + ' ' + station.name }}
                </button>
              </div>
            </section>
          </div>

          <!-- 固定在頁面底部的區塊 -->
          <div class="bottom-buttons">
            <BaseButton
              :disabled="!(startStation && endStation)"
              class="w-1/2 mr-2 base-button--set-collection-button"
              @click="addFavoriteRoute"
            >
              加入收藏
            </BaseButton>
            <BaseButton
              :disabled="!(startStation && endStation)"
              class="w-1/2 ml-2 base-button--set-alarm-button"
              @click="startCountdown"
            >
              設定鬧鐘
            </BaseButton>
          </div>
        </div>
      </template>

      <template #tab1>
        <div class="py-4">
          <p class="text-grey-500 mt-4 mb-2 px-4">我的收藏路線</p>

          <div class="favorites-container">
            <div v-for="(route, index) in favoriteRoutes" :key="index" class="favorite-route">
              <div class="favorite-content">
                <div
                  class="color-block"
                  :style="{ backgroundColor: getButtonColor(route.line?.lineid) }"
                ></div>
                <p>{{ route.start?.name }} - {{ route.end?.name }}</p>
                <button @click="removeFavoriteRoute(index)" class="delete-favorite-button">
                  <img src="../assets/images/delete.svg" alt="Delete" class="icon" />
                </button>
                <button @click="setFavoriteTimer(route)" class="set-timer-button">
                  <img src="../assets/images/alarm.svg" alt="Alarm" class="icon" />
                </button>
              </div>
            </div>
          </div>
        </div>
        <BaseDialog
          v-model="arrivalDialogOpen"
          title=""
          :content="'列車即將到站，是否顯示車站資訊？'"
          :is-scheck="true"
          @onPositiveClick="onArrivalClick"
          positiveText="確定"
          negative-text="取消"
        />
        <BaseDialog
          v-model="isSettingAlarm"
          title=""
          :content="'鬧鐘將在 ' + (travelTimeFormatted || '') + ' 後響起'"
          :is-settingAlarm="true"
          negative-text="關閉"
          @onNegativeClick="onRemoveClick"
        />
      </template>
    </ServiceTabsView>
  </main>
</template>