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

      // 获取权限信息 - data 字段直接是 PermissionsData 对象
      const permissionsResponse = await getPermissions({ role: user.name });
      const { menus, perms } = permissionsResponse.data;
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
