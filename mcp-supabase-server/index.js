#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// 환경 변수 로드
dotenv.config();

// Supabase 클라이언트 초기화
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('SUPABASE_URL and SUPABASE_ANON_KEY are required');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// MCP 서버 생성
const server = new Server(
  {
    name: 'supabase-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// 툴 목록 요청 처리
server.setRequestHandler('tools/list', async () => {
  return {
    tools: [
      {
        name: 'get_user_calculations',
        description: '사용자 계산 결과를 조회합니다',
        inputSchema: {
          type: 'object',
          properties: {
            limit: {
              type: 'number',
              description: '조회할 결과 수 (기본값: 10)',
            },
            order: {
              type: 'string',
              description: '정렬 순서 (latest, oldest)',
              enum: ['latest', 'oldest'],
            }
          }
        }
      },
      {
        name: 'get_calculation_by_id',
        description: 'ID로 특정 계산 결과를 조회합니다',
        inputSchema: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: '조회할 계산 결과의 ID'
            }
          },
          required: ['id']
        }
      },
      {
        name: 'insert_user_calculation',
        description: '새로운 사용자 계산 결과를 저장합니다',
        inputSchema: {
          type: 'object',
          properties: {
            nickname: { type: 'string', description: '사용자 닉네임' },
            gender: { type: 'string', enum: ['male', 'female'], description: '성별' },
            age: { type: 'number', description: '나이' },
            monthly_total: { type: 'number', description: '월 총 생활비' },
            yearly_total: { type: 'number', description: '연 총 생활비' },
            total_needed: { type: 'number', description: '총 필요 금액' },
            remaining_years: { type: 'number', description: '남은 년수' },
            cost_breakdown: { type: 'object', description: '비용 세부 내역' }
          },
          required: ['nickname', 'gender', 'age', 'monthly_total', 'yearly_total', 'total_needed', 'remaining_years', 'cost_breakdown']
        }
      },
      {
        name: 'get_statistics',
        description: '전체 통계 정보를 조회합니다',
        inputSchema: {
          type: 'object',
          properties: {}
        }
      }
    ]
  };
});

// 툴 실행 요청 처리
server.setRequestHandler('tools/call', async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'get_user_calculations': {
        const limit = args?.limit || 10;
        const order = args?.order || 'latest';
        const ascending = order === 'oldest';
        
        const { data, error } = await supabase
          .from('user_calculations')
          .select('*')
          .order('created_at', { ascending })
          .limit(limit);

        if (error) throw error;

        return {
          content: [
            {
              type: 'text',
              text: `📊 사용자 계산 결과 ${data?.length || 0}개를 조회했습니다:\n\n${JSON.stringify(data, null, 2)}`
            }
          ]
        };
      }

      case 'get_calculation_by_id': {
        const { id } = args;
        
        const { data, error } = await supabase
          .from('user_calculations')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;

        return {
          content: [
            {
              type: 'text',
              text: `🔍 계산 결과 (ID: ${id}):\n\n${JSON.stringify(data, null, 2)}`
            }
          ]
        };
      }

      case 'insert_user_calculation': {
        const { data, error } = await supabase
          .from('user_calculations')
          .insert([args])
          .select();

        if (error) throw error;

        return {
          content: [
            {
              type: 'text',
              text: `✅ 새로운 계산 결과가 저장되었습니다:\n\n${JSON.stringify(data?.[0], null, 2)}`
            }
          ]
        };
      }

      case 'get_statistics': {
        const { data: calculations, error } = await supabase
          .from('user_calculations')
          .select('age, gender, monthly_total, total_needed, created_at, kakao_sent');

        if (error) throw error;

        if (!calculations || calculations.length === 0) {
          return {
            content: [
              {
                type: 'text',
                text: '📈 아직 저장된 계산 결과가 없습니다.'
              }
            ]
          };
        }

        const stats = {
          total_users: calculations.length,
          average_age: Math.round(calculations.reduce((sum, calc) => sum + calc.age, 0) / calculations.length),
          average_monthly_cost: Math.round(calculations.reduce((sum, calc) => sum + calc.monthly_total, 0) / calculations.length),
          average_total_needed: Math.round(calculations.reduce((sum, calc) => sum + calc.total_needed, 0) / calculations.length),
          gender_distribution: {
            male: calculations.filter(calc => calc.gender === 'male').length,
            female: calculations.filter(calc => calc.gender === 'female').length
          },
          kakao_sent_count: calculations.filter(calc => calc.kakao_sent).length,
          recent_calculations: calculations.filter(calc => {
            const calcDate = new Date(calc.created_at);
            const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            return calcDate > lastWeek;
          }).length
        };

        return {
          content: [
            {
              type: 'text',
              text: `📊 노후 생활비 계산기 통계:\n\n${JSON.stringify(stats, null, 2)}`
            }
          ]
        };
      }

      default:
        throw new Error(`알 수 없는 도구: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `❌ 오류 발생: ${error.message}`
        }
      ],
      isError: true
    };
  }
});

// 서버 시작
async function main() {
  try {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('✅ Supabase MCP 서버가 시작되었습니다');
  } catch (error) {
    console.error('❌ 서버 시작 실패:', error);
    process.exit(1);
  }
}

// 프로세스 종료 시 정리
process.on('SIGINT', () => {
  console.error('🛑 서버를 종료합니다...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.error('🛑 서버를 종료합니다...');
  process.exit(0);
});

main().catch((error) => {
  console.error('❌ 예상하지 못한 오류:', error);
  process.exit(1);
}); 