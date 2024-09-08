<script setup lang="ts">
import { useRoute } from 'vue-router';
import colors from '../../public/MRTinfo/mrtColors.json';
import magicon from '../iconsinuse/magifier.svg';
import transicon from '../iconsinuse/transfer.svg';
import bikeicon from '../iconsinuse/bike.svg';
import lockicon from '../iconsinuse/locker.svg';
import accessicon from '../iconsinuse/access.svg';

const route = useRoute();
const endStation = route.query.endStation as string;
let endStationLine = route.query.endStationLine as string | string[];
const stationID = route.query.stationid as string;

// Ensure that endStationLine is a string
if (Array.isArray(endStationLine)) {
  endStationLine = endStationLine[0]; // Use the first element if it's an array
}

// Function to get the line color dynamically
const getlineColor = (lineid: string) => {
  return colors[lineid as keyof typeof colors] || '#000000';
};

// Now we can safely use endStationLine as a string
const stationColor = getlineColor(endStationLine);

const tiles = [
  {
    id: 1,
    title: '找地點',
    subtitle: 'Find Location',
    icon: magicon,
    size: 'large',
    route: '/surrounding-service',
    external: false
  },
  {
    id: 2,
    title: '無障礙設施',
    subtitle: 'Accessibility',
    icon: accessicon,
    size: 'medium',
    route: '/noob',
    external: false
  },
  {
    id: 3,
    title: '轉程資訊',
    subtitle: 'Transfer Info',
    icon: transicon,
    size: 'medium',
    route: '/transfer',
    external: false
  },
  {
    id: 4,
    title: '本站置物櫃',
    subtitle: 'Station Lockers',
    icon: lockicon,
    size: 'medium',
    route: '/locker',
    external: false
  }
];
</script>

<template>
  <div class="station-page">
    <h2 class="main-heading">您將抵達</h2>
    <h1 class="station-name" :style="{ backgroundColor: stationColor }">
      {{ stationID + ' ' + endStation }}
    </h1>
    <p class="text-grey-500 mt-4 mb-2 px-4">請選擇所需服務</p>
    <div class="tiles-container">
      <template v-for="tile in tiles" :key="tile.id">
        <router-link 
        v-if="!tile.external" 
        :to="{ path: tile.route, query: { endStation: endStation, endStationLine: endStationLine } }"
        class="tile-link"
        >
          <div :class="['tile', `tile-${tile.size}`]">
            <div class="tile-content">
              <div class="tile-icon">
                <img
                  v-if="tile.icon.endsWith('.svg')"
                  :src="tile.icon"
                  alt="Icon"
                  class="icon-svg"
                />
                <span v-else>{{ tile.icon }}</span>
              </div>
              <div class="tile-text">
                <div class="tile-title">{{ tile.title }}</div>
                <div class="tile-subtitle">{{ tile.subtitle }}</div>
              </div>
            </div>
          </div>
        </router-link>

        <!-- External link handling -->
        <a v-else :href="tile.route" class="tile-link" target="_blank">
          <div :class="['tile', `tile-${tile.size}`]">
            <div class="tile-content">
              <div class="tile-icon">
                <img
                  v-if="tile.icon.endsWith('.svg')"
                  :src="tile.icon"
                  alt="Icon"
                  class="icon-svg"
                />
                <span v-else>{{ tile.icon }}</span>
              </div>
              <div class="tile-text">
                <div class="tile-title">{{ tile.title }}</div>
                <div class="tile-subtitle">{{ tile.subtitle }}</div>
              </div>
            </div>
          </div>
        </a>
      </template>
    </div>
  </div>
</template>

<style lang="postcss">
.station-page {
  @apply flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4;
}
.main-heading {
  @apply text-xl font-semibold text-gray-700 mb-2;
}
.station-name {
  @apply text-2xl font-bold text-center mb-1;
}
.station-description {
  @apply text-base text-gray-600 mb-6;
}

.tiles-container {
  @apply grid gap-4 w-full max-w-4xl mx-auto p-4;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: repeat(2, minmax(120px, auto));
  grid-template-areas:
    'large large medium1 medium2'
    'large large medium3 medium3';
}

.tile-large {
  grid-area: large;
}
.tile-medium:nth-of-type(2) {
  grid-area: medium1;
}
.tile-medium:nth-of-type(3) {
  grid-area: medium2;
}
.tile-medium:nth-of-type(4) {
  grid-area: medium3;
}

@media (max-width: 768px) {
  .tiles-container {
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(3, minmax(100px, auto));
    grid-template-areas:
      'large large'
      'medium1 medium2'
      'medium3 medium3';
  }
}

.tile {
  @apply bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-200 ease-in-out;
}

.tile:hover {
  @apply transform scale-105;
}

.tile-content {
  @apply flex flex-col justify-between h-full p-4;
}

.tile-icon {
  @apply text-3xl mb-2;
}

.tile-text {
  @apply flex flex-col;
}

.tile-title {
  @apply font-bold text-lg;
}

.tile-subtitle {
  @apply text-sm text-gray-600;
}

/* Adjustments for very small screens */
@media (max-width: 350px) {
  .tiles-container {
    @apply gap-2 p-2;
  }

  .tile-content {
    @apply p-2;
  }

  .tile-title {
    @apply text-base;
  }

  .tile-subtitle {
    @apply text-xs;
  }
}
.icon-svg {
  @apply w-10 h-10; /* Adjust size as needed */
}
.station-name {
  @apply text-2xl font-bold text-center mb-1;
  background: rgba(0, 0, 0, 0.5); /* Replace rgba values with your desired color and opacity */
  color: #fff; /* Text color for better contrast on a dark background */
  padding: 0.5em 1em; /* Adjust padding as needed */
  border-radius: 4px; /* Optional: for rounded corners */
}

.station-name::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border: 4px solid; /* Border thickness for the outline */
  border-color: inherit; /* Use the dynamic color */
  z-index: -1; /* Position behind the station name */
  border-radius: 4px; /* Optional: adjust border-radius for rounded effect */
}
</style>
