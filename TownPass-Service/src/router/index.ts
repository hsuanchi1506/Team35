import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import FormView from '../views/FormView.vue';
import SurroundingServiceView from '../views/SurroundingServiceView.vue';
import TopQnAListView from '../views/TopQnAListView.vue';
import QnAListView from '../views/QnAListView.vue';
import CouponView from '../views/CouponView.vue';
import CouponListView from '../views/CouponListView.vue';
import HotSpotView from '../views/HotSpotView.vue';
import TicketDetail from '../views/TicketDetail.vue';
import CouponDetail from '../views/CouponDetail.vue';
import StationTimerView from '../views/StationTimerView.vue';
import ArrivalView from '@/views/ArrivalView.vue';
import NoObView from '../views/NoObView.vue';
import TransferView from '../views/TransferView.vue';
import LockerView from '../views/LockerView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'stationtimer',
      component: StationTimerView
    },
    {
      path: '/arrival',
      name: 'arrival',
      component: ArrivalView
    },
    {
      path: '/noob',
      name: 'noob',
      component: NoObView
    },
    {
      path: '/locker',
      name: 'locker',
      component: LockerView
    },
    {
      path: '/transfer',
      name: 'transfer',
      component: TransferView
    },
    // {
    //   path: '/',
    //   name: 'home',
    //   component: HomeView
    // },
    {
      path: '/form/:id',
      name: 'form',
      component: FormView
    },
    {
      path: '/surrounding-service',
      name: 'surrounding-service',
      component: SurroundingServiceView
    },
    {
      path: '/qna',
      name: 'top-qna-list',
      component: TopQnAListView
    },
    {
      path: '/qna/categories',
      name: 'qna-list',
      component: QnAListView
    },
    {
      path: '/coupon',
      children: [
        {
          path: '',
          name: 'coupon',
          component: CouponView
        },
        {
          path: 'list',
          name: 'coupon-list',
          component: CouponListView
        },
        {
          path: 'hotspot/:id',
          name: 'hotspot',
          component: HotSpotView
        },
        {
          path: 'ticket-detail/:id',
          name: 'ticket-detail',
          component: TicketDetail
        },
        {
          path: 'coupon-detail/:id',
          name: 'coupon-detail',
          component: CouponDetail
        }
      ]
    }
  ]
});

export default router;
