import type { LoginData, LoginResult, UserInfoResponse, PermissionsResponse } from './model';
import type { SideMenu } from '#/public';
import { extractRoutePathsFromMenus } from '@/utils/menuUtils';
import type { FormProps } from 'antd';
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Checkbox, message, Form, Button, Input } from 'antd';
import { getUserInfoServe, login } from '@/servers/login';
import { setTitle } from '@/utils/helper';
import { encryption, decryption } from '@manpao/utils';
import { getFirstMenu } from '@/menus/utils/helper';
import Logo from '@/assets/images/logo.png';
import { setAccessToken, setRefreshToken } from '@/stores/token';
import { getPermissions } from '@/servers/login';
import { useCommonStore } from '@/hooks/useCommonStore';
import { useMenuStore } from '@/stores/menu';
import { usePublicStore } from '@/stores/public';
import { useUserStore } from '@/stores/user';
const CHECK_REMEMBER = 'remember-me';

function Login() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [isLoading, setLoading] = useState(false);
  const [isRemember, setRemember] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const { search } = useLocation();
  const { clearLoginInfo, saveLoginInfo } = useCommonStore();
  const setMenuList = useMenuStore((state) => state.setMenuList);
  const setThemeValue = usePublicStore((state) => state.setThemeValue);
  const { setPermissions, setUserInfo, setMenuPermissions } = useUserStore((state) => state);
  const themeCache = (localStorage.getItem(THEME_KEY) ?? 'light') as ThemeType;

  //主题色挂载
  useEffect(() => {
    if (!themeCache) {
      localStorage.setItem(THEME_KEY, 'light');
    }
    if (themeCache === 'dark') {
      document.body.className = 'theme-dark';
    }
    setThemeValue(themeCache === 'dark' ? 'dark' : 'light');
  }, [themeCache]);

  // 初始化记住我状态
  useEffect(() => {
    const rememberStatus = localStorage.getItem(CHECK_REMEMBER);
    if (rememberStatus !== null) {
      setRemember(rememberStatus === 'true');
    }
  }, []);

  // 语言切换修改title
  useEffect(() => {
    setTitle(t, t('login.login'));
  }, [i18n.language]);

  /** 获取重定向路由 */
  const getRedirectUrl = () => {
    if (!search || !search.includes('?redirect=')) {
      return '';
    }
    const urlParams = new URLSearchParams(search);
    return urlParams.get('redirect') || '';
  };

  /** 菜单跳转 */
  const handleGoMenu = async (menus: SideMenu[], userPermissions: string[]) => {
    // 检查是否有重定向URL
    if (search?.includes('?redirect=')) {
      console.log('re');
      const redirectUrl = getRedirectUrl();
      if (redirectUrl) {
        // 验证重定向URL是否有权限访问
        const hasRedirectPermission = userPermissions.includes(redirectUrl);
        if (hasRedirectPermission) {
          navigate(redirectUrl, { replace: true });
          return;
        }
      }
    }

    // 获取第一个有权限的菜单
    const firstMenu = getFirstMenu(menus, userPermissions);
    if (!firstMenu) {
      return messageApi.error({ content: t('login.notPermissions'), key: 'permissions' });
    }
    navigate(firstMenu, { replace: true });
  };

  //获取用户信息
  const getUserInfo = async () => {
    try {
      setLoading(true);
      // 获取用户信息 - data 字段直接是 UserInfo 对象
      const { data: user } = await getUserInfoServe();
      // 获取权限信息 - data 字段直接是 PermissionsData 对象
      setUserInfo(user);
      return { user };
    } finally {
      setLoading(false);
    }
  };

  //获取用户权限
  const getUserPermissions = async (user: any) => {
    try {
      setLoading(true);
      const menus = [
        {
          key: 1,
          pid: 0,
          label: '仪表盘',
          icon: 'la:tachometer-alt',
          sort: 1,
          type: 2,
          route_path: '/dashboard',
          component_path: '/dashboard',
          permission: 'dashboard',
          route_name: '/dashboard',
        },
        {
          key: 201,
          pid: 0,
          label: '组件',
          icon: 'fluent:box-20-regular',
          sort: 1,
          type: 1,
          route_path: '/demo',
          component_path: 'Layout',
          permission: 'demo',
          route_name: '/demo',
        },
        {
          key: 202,
          pid: 201,
          label: '剪切板',
          icon: null,
          sort: 1,
          type: 2,
          route_path: '/demo/copy',
          component_path: '/demo/copy/index',
          permission: 'demo/copy',
          route_name: '/demo/copy',
        },
        {
          key: 203,
          pid: 201,
          label: '水印',
          icon: null,
          sort: 2,
          type: 2,
          route_path: '/demo/watermark',
          component_path: '/demo/watermark/index',
          permission: 'demo/watermark',
          route_name: '/demo/watermark',
        },
        {
          key: 204,
          pid: 201,
          label: '虚拟滚动',
          icon: null,
          sort: 3,
          type: 2,
          route_path: '/demo/virtualScroll',
          component_path: '/demo/virtualScroll/index',
          permission: 'demo/virtualScroll',
          route_name: '/demo/virtualScroll',
        },
        {
          key: 205,
          pid: 201,
          label: '富文本',
          icon: null,
          sort: 4,
          type: 2,
          route_path: '/demo/editor',
          component_path: '/demo/editor/index',
          permission: 'demo/editor',
          route_name: '/demo/editor',
        },
        {
          key: 206,
          pid: 201,
          label: '层级1',
          icon: null,
          sort: 5,
          type: 1,
          route_path: '/demo/level1',
          component_path: 'Layout',
          permission: 'demo/level1',
          route_name: '/demo/level1',
        },
        {
          key: 207,
          pid: 206,
          label: '层级2',
          icon: null,
          sort: 1,
          type: 1,
          route_path: '/demo/level1/level2',
          component_path: 'Layout',
          permission: 'demo/level1/level2',
          route_name: '/demo/level1/level2',
        },
        {
          key: 208,
          pid: 207,
          label: '层级3',
          icon: null,
          sort: 1,
          type: 2,
          route_path: '/demo/level1/level2/level3',
          component_path: '/demo/level1/level2/level3/index',
          permission: 'demo/level1/level2/level3',
          route_name: '/demo/level1/level2/level3',
        },
        {
          key: 209,
          pid: 0,
          label: '商家管理',
          icon: 'la:tachometer-alt',
          sort: 1,
          type: 1,
          route_path: '/merchantManage',
          component_path: 'layout',
          permission: 'merchantManage',
          route_name: '/merchantManage',
        },
        {
          key: 210,
          pid: 209,
          label: '商家分类',
          icon: null,
          sort: 1,
          type: 2,
          route_path: '/merchantManage/merchantSort',
          component_path: '/merchantManage/merchantSort/index',
          permission: 'merchantManage/merchantSort',
          route_name: '/merchantManage/merchantSort',
        },
        {
          key: 211,
          pid: 209,
          label: '商家详情列表',
          icon: null,
          sort: 2,
          type: 2,
          route_path: '/merchantManage/merchants',
          component_path: '/merchantManage/merchants/index',
          permission: 'merchantManage/merchants',
          route_name: '/merchantManage/merchants',
        },
        {
          key: 212,
          pid: 209,
          label: '商家申请列表',
          icon: null,
          sort: 3,
          type: 2,
          route_path: '/merchantManage/merchantApplication',
          component_path: '/merchantManage/merchantApplication/index',
          permission: 'merchantManage/merchantApplication',
          route_name: '/merchantManage/merchantApplication',
        },
        {
          key: 213,
          pid: 0,
          label: '楼栋楼层管理',
          icon: 'fluent:box-20-regular',
          sort: 1,
          type: 2,
          route_path: '/buildsManage',
          component_path: '/buildsManage',
          permission: 'buildsManage',
          route_name: '/buildsManage',
        },
        {
          key: 214,
          pid: 0,
          label: '余额明细管理',
          icon: 'fluent:box-20-regular',
          sort: 1,
          type: 2,
          route_path: '/balanceManage',
          component_path: '/balanceManage',
          permission: 'balanceManage',
          route_name: '/balanceManage',
        },
        {
          key: 215,
          pid: 0,
          label: '字典管理',
          icon: 'la:tachometer-alt',
          sort: 1,
          type: 2,
          route_path: '/dictionaryManage',
          component_path: '/dictionaryManage',
          permission: 'dictionaryManage',
          route_name: '/dictionaryManage',
        },
        {
          key: 216,
          pid: 0,
          label: '学校管理',
          icon: 'la:tachometer-alt',
          sort: 1,
          type: 2,
          route_path: '/schoolsManage',
          component_path: '/schoolsManage',
          permission: 'schoolsManage',
          route_name: '/schoolsManage',
        },
        {
          key: 300,
          pid: 0,
          label: '交易流水管理',
          icon: 'la:tachometer-alt',
          sort: 1,
          type: 2,
          route_path: '/tradeBlotterManage',
          component_path: '/tradeBlotterManage',
          permission: 'tradeBlotterManage',
          route_name: '/tradeBlotterManage',
        },
        {
          key: 226,
          pid: 0,
          label: '用户管理',
          icon: 'la:tachometer-alt',
          sort: 1,
          type: 2,
          route_path: '/usersManage',
          component_path: '/usersManage',
          permission: 'usersManage',
          route_name: '/usersManage',
        },
        {
          key: 229,
          pid: 0,
          label: '城市管理',
          icon: 'la:tachometer-alt',
          sort: 1,
          type: 2,
          route_path: '/citysManage',
          component_path: '/citysManage',
          permission: 'citysManage',
          route_name: '/citysManage',
        },
        {
          key: 239,
          pid: 0,
          label: '团长管理',
          icon: 'la:tachometer-alt',
          sort: 1,
          type: 2,
          route_path: '/colonelManage',
          component_path: '/colonelManage',
          permission: 'colonelManage',
          route_name: '/colonelManage',
        },
        {
          key: 249,
          pid: 0,
          label: '实名认证',
          icon: 'la:tachometer-alt',
          sort: 1,
          type: 2,
          route_path: '/certManage',
          component_path: '/certManage',
          permission: 'certManage',
          route_name: '/certManage',
        },
        {
          key: 250,
          pid: 0,
          label: '权限管理',
          icon: 'la:tachometer-alt',
          sort: 1,
          type: 2,
          route_path: '/permissionManage',
          component_path: '/permissionManage',
          permission: 'permissionManage',
          route_name: '/permissionManage',
        },
        {
          key: 251,
          pid: 250,
          label: '菜单管理',
          icon: 'la:tachometer-alt',
          sort: 1,
          type: 2,
          route_path: '/permissionManage/menuManage',
          component_path: '/permissionManage/menuManage/index',
          permission: 'permissionManage/menuManage',
          route_name: '/permissionManage/menuManage',
        },
        {
          key: 252,
          pid: 250,
          label: '角色管理',
          icon: 'la:tachometer-alt',
          sort: 1,
          type: 2,
          route_path: '/permissionManage/roleManage',
          component_path: '/permissionManage/menuManage/index',
          permission: 'permissionManage/roleManage',
          route_name: '/permissionManage/roleManage',
        },
        {
          key: 253,
          pid: 250,
          label: 'API管理',
          icon: 'la:tachometer-alt',
          sort: 1,
          type: 2,
          route_path: '/permissionManage/apiManage',
          component_path: '/permissionManage/apiManage/index',
          permission: 'permissionManage/apiManage',
          route_name: '/permissionManage/apiManage',
        },
      ];
      // 获取权限信息 - data 字段直接是 PermissionsData 对象
      // const permissionsResponse = await getPermissions({ role: user.user.name });
      // const { menus, perms } = permissionsResponse.data;
      setMenuList(menus);
      console.log(menus);
      // 转换后端菜单数据格式

      // 从菜单中提取route_path作为权限（因为权限系统基于路径匹配）
      const routePermissions = extractRoutePathsFromMenus(menus);
      console.log('从菜单中提取的权限路径:', routePermissions);

      // 使用路径权限作为最终权限
      const finalPermissions = routePermissions;

      setPermissions(finalPermissions);
      return { menus: menus, perms: finalPermissions };
    } finally {
      setLoading(false);
    }
  };
  /**
   * 处理登录
   * @param values - 表单数据
   */
  const handleFinish: FormProps['onFinish'] = async (values: LoginData) => {
    try {
      setLoading(true);
      const loginResponse = await login(values);
      saveLoginInfo(values.account, values.password);
      const loginResult = loginResponse.data;
      // 从 LoginResult 对象中，访问其内部的 data 属性，再获取 token
      const refresh_token = loginResult.refresh_token;
      const access_token = loginResult.access_token;
      setAccessToken(access_token);
      setRefreshToken(refresh_token);

      // 获取用户信息 - data 字段直接是 UserInfo 对象
      const user = await getUserInfo();
      console.log('用户信息数据:', user);
      // 获取权限信息 - data 字段直接是 PermissionsData 对象
      const { menus, perms } = await getUserPermissions(user);
      console.log(menus);
      setMenuPermissions(extractRoutePathsFromMenus(menus));
      // 处理记住我逻辑 - 在登录成功后保存账号密码
      const passwordObj = { value: values.password, expire: 0 };
      handleRemember(values.account, encryption(passwordObj));

      if (!perms || !refresh_token) {
        console.log('权限检查失败 - perms:', perms, 'refresh_token:', refresh_token);
        return messageApi.error({ content: t('login.notPermissions'), key: 'permissions' });
      }
      await handleGoMenu(menus, perms);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 处理失败
   * @param errors - 错误信息
   */
  const handleFinishFailed: FormProps['onFinishFailed'] = (errors) => {
    console.error('错误信息:', errors);
  };

  /** 点击记住我 */
  const onRemember = () => {
    const newRememberState = !isRemember;
    setRemember(newRememberState);
    localStorage.setItem(CHECK_REMEMBER, newRememberState ? 'true' : 'false');
  };

  /**
   * 记住我逻辑
   */
  const handleRemember = (account: string, password: string) => {
    if (isRemember) {
      saveLoginInfo(account, password);
    } else {
      clearLoginInfo();
    }
  };

  /** 点击忘记密码 */
  const onForgetPassword = () => {
    navigate(`/forget${search}`);
  };

  return (
    <>
      {contextHolder}
      <div
        className={`
        ${themeCache === 'dark' ? 'bg-black text-white' : 'bg-light-400'}
        w-screen
        h-screen
        relative
      `}
      >
        <div className="flex absolute top-5 right-5">
          <I18n />
          <Theme />
        </div>
        <div
          className={`
          ${themeCache === 'dark' ? 'bg-black bg-dark-200' : 'bg-white'}
          w-340px
          p-1.8rem
          rounded-10px
          box-border
          absolute
          left-1/2
          top-1/2
          -translate-x-1/2
          -translate-y-1/2
          shadow-[2px_5px_20px_rgba(0,0,0,0.1)]
        `}
        >
          <div className="pb-20px pt-10px flex items-center justify-center">
            <img className="mr-2 object-contain" width="32" height="32" src={Logo} alt="LOGO" />
            <span className="text-22px font-bold tracking-2px">{t('login.systemLogin')}</span>
          </div>
          <Form
            form={form}
            layout="vertical"
            name="horizontal_login"
            autoComplete="on"
            onFinish={handleFinish}
            onFinishFailed={handleFinishFailed}
            initialValues={{
              account: '1234561234',
              password: 'zxc123',
            }}
          >
            <div className="text-#AAA6A6 text-14px mb-8px">{t('login.username')}</div>

            <Form.Item
              name="account"
              className="!mb-15px"
              rules={[
                { required: true, message: t('public.pleaseEnter', { name: t('login.username') }) },
              ]}
            >
              <Input
                allow-clear="true"
                placeholder={t('public.pleaseEnter', { name: t('login.account') })}
                autoComplete="username"
              />
            </Form.Item>

            <div className="text-#AAA6A6 text-14px mb-8px">{t('login.password')}</div>

            <Form.Item
              name="password"
              className="!mb-15px"
              rules={[
                { required: true, message: t('public.pleaseEnter', { name: t('login.password') }) },
                PASSWORD_RULE(t),
              ]}
            >
              <Input.Password
                name="password"
                placeholder={t('public.pleaseEnter', { name: t('login.password') })}
                autoComplete="current-password"
              />
            </Form.Item>

            <Button
              type="primary"
              htmlType="submit"
              className="w-full mt-15px mb-25px rounded-5px tracking-2px"
              loading={isLoading}
            >
              {t('login.login')}
            </Button>
          </Form>

          <div className="flex justify-between items-center mb-5px px-1px">
            <Checkbox name="remember" checked={isRemember} onChange={onRemember}>
              {t('login.rememberMe')}
            </Checkbox>

            <div className="text-blue-500 cursor-pointer" onClick={onForgetPassword}>
              {t('login.forgetPassword')}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;
