import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { spawn } from 'child_process';

async function testMCPServer() {
  try {
    // MCP 서버 시작
    const serverProcess = spawn('node', ['./mcp-supabase-server/index.js'], {
      env: {
        ...process.env,
        SUPABASE_URL: 'https://lbauttbgkrhjvvkyyrnl.supabase.co',
        SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxiYXV0dGJna3JoanZ2a3l5cm5sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkyNjc3NDgsImV4cCI6MjA2NDg0Mzc0OH0.vfyZI1gsshSMIzisLbLX9ivVM65S_H5jq_l2zLdzaGk'
      }
    });

    // 클라이언트 설정
    const transport = new StdioClientTransport({
      command: 'node',
      args: ['./mcp-supabase-server/index.js'],
      env: {
        SUPABASE_URL: 'https://lbauttbgkrhjvvkyyrnl.supabase.co',
        SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxiYXV0dGJna3JoanZ2a3l5cm5sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkyNjc3NDgsImV4cCI6MjA2NDg0Mzc0OH0.vfyZI1gsshSMIzisLbLX9ivVM65S_H5jq_l2zLdzaGk'
      }
    });

    const client = new Client(
      {
        name: 'supabase-mcp-test-client',
        version: '1.0.0',
      },
      {
        capabilities: {},
      }
    );

    await client.connect(transport);
    console.log('MCP 서버에 연결되었습니다!');

    // 사용 가능한 도구 목록 조회
    const tools = await client.request('tools/list', {});
    console.log('사용 가능한 도구들:');
    tools.tools.forEach(tool => {
      console.log(`- ${tool.name}: ${tool.description}`);
    });

    // 통계 조회 테스트
    console.log('\n통계 정보 조회 중...');
    const statsResult = await client.request('tools/call', {
      name: 'get_statistics',
      arguments: {}
    });
    console.log('통계 결과:', statsResult.content[0].text);

    // 최근 계산 결과 조회 테스트
    console.log('\n최근 계산 결과 조회 중...');
    const calculationsResult = await client.request('tools/call', {
      name: 'get_user_calculations',
      arguments: { limit: 5, order: 'latest' }
    });
    console.log('계산 결과:', calculationsResult.content[0].text);

    await client.close();
    serverProcess.kill();
    console.log('테스트가 완료되었습니다!');

  } catch (error) {
    console.error('테스트 중 오류 발생:', error);
  }
}

testMCPServer(); 