import { Card } from 'antd';
import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import type { BeansDailyStats } from '../model';

interface BeansChartProps {
  data: BeansDailyStats;
}

export const BeansChart: React.FC<BeansChartProps> = ({ data }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    // 初始化或获取 ECharts 实例
    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current);
    }

    const option: echarts.EChartsOption = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
        formatter: (params: any) => {
          const param = Array.isArray(params) ? params[0] : params;
          return `${param.name}<br/>${param.marker}${param.seriesName}: ${param.value.toFixed(2)} 金豆`;
        },
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: '15%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: ['产出', '消耗', '净增'],
        axisLine: {
          lineStyle: {
            color: '#ddd',
          },
        },
        axisLabel: {
          color: '#666',
        },
      },
      yAxis: {
        type: 'value',
        name: '金豆',
        nameTextStyle: {
          color: '#666',
        },
        axisLine: {
          lineStyle: {
            color: '#ddd',
          },
        },
        axisLabel: {
          color: '#666',
        },
        splitLine: {
          lineStyle: {
            type: 'dashed',
            color: '#f0f0f0',
          },
        },
      },
      series: [
        {
          name: '金豆数量',
          type: 'bar',
          data: [
            {
              value: data.production,
              itemStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: '#73d13d' },
                  { offset: 1, color: '#52c41a' },
                ]),
              },
            },
            {
              value: data.consumption,
              itemStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: '#ff7875' },
                  { offset: 1, color: '#ff4d4f' },
                ]),
              },
            },
            {
              value: data.netIncrease,
              itemStyle: {
                color:
                  data.netIncrease >= 0
                    ? new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: '#69c0ff' },
                        { offset: 1, color: '#1890ff' },
                      ])
                    : new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: '#ffa39e' },
                        { offset: 1, color: '#f5222d' },
                      ]),
              },
            },
          ],
          barWidth: '40%',
          label: {
            show: true,
            position: 'top',
            formatter: '{c}',
            color: '#666',
          },
        },
      ],
    };

    chartInstance.current.setOption(option);

    // 响应式处理
    const handleResize = () => {
      chartInstance.current?.resize();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [data]);

  // 清理
  useEffect(() => {
    return () => {
      chartInstance.current?.dispose();
      chartInstance.current = null;
    };
  }, []);

  return (
    <Card
      title="今日金豆变动趋势"
      bordered={false}
      style={{ height: '100%' }}
    >
      <div
        ref={chartRef}
        style={{ width: '100%', height: '300px' }}
      />
    </Card>
  );
};
