import type { LoginData, MenuItem, UserInfo, CaptchaData } from './model';
import { extractRoutePathsFromMenus } from '@/utils/menuUtils';
import type { FormProps } from 'antd';
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { message, Form, Button, Input } from 'antd';
import { getUserInfoServe, login, getCode } from '@/servers/login';
import { getFirstMenu } from '@/menus/utils/helper';
import Logo from '@/assets/images/logo.png';
import { setAccessToken, setRefreshToken } from '@/stores/token';
import { getPermissions } from '@/servers/login';
import { useCommonStore } from '@/hooks/useCommonStore';
import { useMenuStore } from '@/stores/menu';
import { usePublicStore } from '@/stores/public';
import { useUserStore } from '@/stores/user';
import { THEME_KEY } from '@/utils/config';
import { ThemeType } from '@/stores/public';
import I18n from '@/components/I18n';
import Theme from '@/components/Theme';
import { PermissionsData } from './model'

function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [isLoading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [captchaUrl, setCaptchaUrl] = useState<string>('');
  const [captchaId, setCaptchaId] = useState<string>('');
  const { search } = useLocation();
  const { saveLoginInfo } = useCommonStore();
  const setMenuList = useMenuStore((state) => state.setMenuList);
  const setThemeValue = usePublicStore((state) => state.setThemeValue);
  const { setPermissions, clearInfo, setUserInfo, setMenuPermissions } = useUserStore((state) => state);
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

  //登录
  useEffect(() => {
    // 清除可能存在的过期权限和菜单数据
    setPermissions([]);
    setMenuPermissions([]);
    setMenuList([]);
    clearInfo();
    handleGetCaptcha();
  }, []);

  /** 获取重定向路由 */
  const getRedirectUrl = () => {
    if (!search || !search.includes('?redirect=')) {
      return '';
    }
    const urlParams = new URLSearchParams(search);
    return urlParams.get('redirect') || '';
  };

  /** 菜单跳转 */
  const handleGoMenu = async (menus: MenuItem[], userPermissions: string[]) => {
    // 检查是否有重定向URL
    if (search?.includes('?redirect=')) {
      const redirectUrl = getRedirectUrl();
      if (redirectUrl) {
        const hasRedirectPermission = userPermissions.includes(redirectUrl);
        if (hasRedirectPermission) {
          navigate(redirectUrl, { replace: true });
          return;
        }
      }
    }

    // 获取第一个有权限的菜单
    const firstMenu = getFirstMenu(menus);
    if (!firstMenu) {
      return messageApi.error({ content: t('login.notPermissions'), key: 'permissions' });
    }
    navigate(firstMenu, { replace: true });
  };

  //获取用户信息
  const getUserInfo = async () => {
    try {
      setLoading(true);
      const userInformation = await getUserInfoServe();
      const Data = userInformation.data as unknown as UserInfo;
      console.log('userdata', Data)
      setUserInfo(Data);
      return { Data };
    } finally {
      setLoading(false);
    }
  };

  //获取用户权限
  const getUserPermissions = async (user: any) => {
    try {
      setLoading(true);
      const permissionsResponse = await getPermissions({ role: user.name });
      const Data = permissionsResponse.data as unknown as PermissionsData;
      const { menus, perms } = Data;
      const routePermissions = extractRoutePathsFromMenus(menus);
      //权限菜单路由
      setMenuPermissions(routePermissions);
      //权限按钮
      setPermissions(perms);
      setMenuList(menus);
      return { menus, perms };
    } finally {
      setLoading(false);
    }
  };

  //登录
  const handleFinish: FormProps['onFinish'] = async (values: LoginData) => {
    try {
      setLoading(true);
      const loginData = {
        ...values,
        captcha_id: captchaId,
        captcha_code: values.captcha_code,
      };
      const loginResponse = await login(loginData);
      saveLoginInfo(values.account, values.password);
      const loginResult = loginResponse.data as unknown as LoginData;
      const refresh_token = loginResult.refresh_token;
      const access_token = loginResult.access_token;
      setAccessToken(access_token);
      setRefreshToken(refresh_token);

      const user = await getUserInfo();
      const { menus, perms } = await getUserPermissions(user);

      if (!perms || !refresh_token) {
        return messageApi.error({ content: t('login.notPermissions'), key: 'permissions' });
      }
      await handleGoMenu(menus, perms);
    } catch (error) {
      console.error('登录失败:', error);
      handleGetCaptcha();
      form.setFieldsValue({
        account: '',
        password: '',
        captcha_code: '',
      });
      messageApi.error('登录失败，请重新输入');
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

  /** 获取验证码 */
  const handleGetCaptcha = async () => {
    try {
      const response = await getCode();
      console.log("code", response)
      const Data = response.data as unknown as CaptchaData
      // 检查不同的响应格式
      let captcha_image, captcha_id;

      if (Data) {
        if (Data) {
          captcha_image = Data.captcha_image;
          captcha_id = Data.captcha_id;
        }
      }
      if (captcha_image) {
        const imageUrl = captcha_image.startsWith('data:image')
          ? captcha_image
          : `data:image/png;base64,${captcha_image}`;

        setCaptchaUrl(imageUrl);
        if (captcha_id) {
          setCaptchaId(captcha_id);
        }
      } else {
        messageApi.error('未找到验证码图片数据');
      }
    } catch (error) {
      console.error('获取验证码失败:', error);
      messageApi.error('获取验证码失败');
    }
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
              account: '',
              password: '',
              captcha_code: '',
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
                placeholder={t('public.pleaseEnter', { name: t('login.username') })}
                autoComplete="username"
              />
            </Form.Item>

            <div className="text-#AAA6A6 text-14px mb-8px">{t('login.password')}</div>

            <Form.Item
              name="password"
              className="!mb-15px"
              rules={[
                { required: true, message: t('public.pleaseEnter', { name: t('login.password') }) },
              ]}
            >
              <Input.Password
                name="password"
                placeholder={t('public.pleaseEnter', { name: t('login.password') })}
                autoComplete="current-password"
              />
            </Form.Item>

            <div className="text-#AAA6A6 text-14px mb-8px">验证码</div>

            <Form.Item
              name="captcha_code"
              className="!mb-15px"
              rules={[{ required: true, message: '请输入验证码' }]}
            >
              <div className="flex items-center gap-2">
                <Input placeholder="请输入验证码" autoComplete="off" className="flex-1" />
                <div
                  className="w-20 h-8 border border-gray-300 rounded flex items-center justify-center cursor-pointer"
                  onClick={handleGetCaptcha}
                >
                  {captchaUrl ? (
                    <img
                      src={captchaUrl}
                      alt="验证码"
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        console.error('验证码图片加载失败:', e);
                      }}
                      onLoad={() => { }}
                    />
                  ) : (
                    <span className="text-xs text-gray-400">点击获取</span>
                  )}
                </div>
              </div>
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

          </div>
        </div>
      </div>
    </>
  );
}

export default Login;
