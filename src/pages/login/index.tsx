import type { LoginData, LoginResult, UserInfoResponse, PermissionsResponse } from './model';
import type { SideMenu } from '#/public';
import { extractRoutePathsFromMenus } from '@/utils/menuUtils';
import type { FormProps } from 'antd';
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Checkbox, message, Form, Button, Input } from 'antd';
import { getUserInfoServe, login, getCode } from '@/servers/login';
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
import { THEME_KEY, PASSWORD_RULE } from '@/utils/config';
import { ThemeType } from '@/stores/public';
import I18n from '@/components/I18n';
import Theme from '@/components/Theme';
const CHECK_REMEMBER = 'remember-me';

function Login() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [isLoading, setLoading] = useState(false);
  const [isRemember, setRemember] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [captchaUrl, setCaptchaUrl] = useState<string>('');
  const [captchaId, setCaptchaId] = useState<string>('');
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
    // 初始化时获取验证码
    handleGetCaptcha();
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
      // 添加验证码信息到登录数据
      const loginData = {
        ...values,
        captcha_id: captchaId,
        captcha_code: values.captcha_code,
      };
      const loginResponse = await login(loginData);
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
    } catch (error) {
      console.error('登录失败:', error);
      // 登录失败时自动刷新验证码
      handleGetCaptcha();
      // 清空所有表单数据
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

  /** 获取验证码 */
  const handleGetCaptcha = async () => {
    try {
      const response = await getCode();

      // 检查不同的响应格式
      let captcha_image, captcha_id;

      if (response.data) {
        // 情况1: response.data.data 结构
        if (response.data.data) {
          captcha_image = response.data.data.captcha_image;
          captcha_id = response.data.data.captcha_id;
        }
        // 情况2: 直接在 response.data 中
        else if (response.data.captcha_image) {
          captcha_image = response.data.captcha_image;
          captcha_id = response.data.captcha_id;
        }
        // 情况3: response 直接包含数据
        else if (response.captcha_image) {
          captcha_image = response.captcha_image;
          captcha_id = response.captcha_id;
        }
      }

      if (captcha_image) {
        // 检查是否已经包含data:image前缀
        const imageUrl = captcha_image.startsWith('data:image')
          ? captcha_image
          : `data:image/png;base64,${captcha_image}`;

        console.log('处理后的验证码URL:', imageUrl);
        setCaptchaUrl(imageUrl);
        if (captcha_id) {
          setCaptchaId(captcha_id);
        }
      } else {
        console.log('未找到验证码图片数据');
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
                PASSWORD_RULE(t),
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
                        console.log('当前图片URL:', captchaUrl);
                      }}
                      onLoad={() => {
                        console.log('验证码图片加载成功');
                      }}
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
            <Checkbox name="remember" checked={isRemember} onChange={onRemember}>
              {t('login.rememberMe')}
            </Checkbox>
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;
