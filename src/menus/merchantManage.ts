import { SideMenu } from '#/public';

export const merchantMenu: SideMenu[] = [
  {
    label: '商家管理',
    labelEn: 'MerchantManage',
    key: '/merchantManage',
    rule: '/merchantManage', // 添加权限规则
    icon: '',
    children: [
      {
        label: '商家分类',
        labelEn: 'MerchantSort',
        key: '/merchantManage/merchantSort',
        rule: '/merchantManage/merchantSort', // 添加权限规则
        icon: '',
      },
      {
        label: '商家详情列表',
        labelEn: 'MerchantDetailList',
        key: '/merchantManage/merchants',
        rule: '/merchantManage/merchants', // 添加权限规则
        icon: '',
      },
      {
        label: '商家申请列表',
        labelEn: 'MerchantApplicationList',
        key: '/merchantManage/merchantApplication',
        rule: '/merchantManage/merchantApplication', // 添加权限规则
        icon: '',
      },
    ],
  },
];
