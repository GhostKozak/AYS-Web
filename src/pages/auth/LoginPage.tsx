import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router';
import apiClient from '../../api/apiClient';
import { API_ENDPOINTS, ROUTES, STORAGE_KEYS } from '../../constants';

function LoginPage() {
  const navigate = useNavigate();

  const onFinish = async (values: any) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, values);
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, response.data.access_token);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.data.user));
      message.success('Giriş başarılı!');
      navigate(ROUTES.DASHBOARD);
    } catch (error) {
      message.error('E-posta veya şifre hatalı!');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <Card title="Giriş Yap" style={{ width: 300 }}>
        <Form onFinish={onFinish}>
          <Form.Item name="email" rules={[{ required: true, message: 'Lütfen e-postanızı girin!' }]}>
            <Input prefix={<UserOutlined />} placeholder="E-posta" />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: 'Lütfen şifrenizi girin!' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="Şifre" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
              Giriş Yap
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

export default LoginPage;