/**
 * 檢查 Notion 資料庫結構工具
 * 用於分析實際的資料庫欄位類型和配置
 */

const config = {
    notion: {
        databaseIds: {
            tables: '23afd5adc30b80fe86c9e086a54a0d61',
            orders: '23afd5adc30b80c39e71d1a640ccfb5d',
            menu: '23afd5adc30b80c58355fd93d05c66d6'
        }
    }
};

async function checkDatabaseStructure(databaseId, name) {
    try {
        console.log(`\n🔍 正在檢查 ${name} 資料庫結構...`);
        console.log(`📊 資料庫 ID: ${databaseId}`);
        
        const response = await fetch(`/.netlify/functions/notion-api/databases/${databaseId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const database = await response.json();
        console.log(`✅ ${name} 資料庫檢查完成`);
        console.log(`📋 標題: ${database.title?.[0]?.plain_text || '未命名'}`);
        
        console.log(`\n📝 ${name} 欄位結構:`);
        console.log('='.repeat(50));
        
        const fields = [];
        Object.entries(database.properties).forEach(([fieldName, fieldConfig]) => {
            const fieldInfo = {
                name: fieldName,
                type: fieldConfig.type,
                id: fieldConfig.id
            };
            
            // 添加特殊配置信息
            if (fieldConfig.type === 'select' && fieldConfig.select?.options) {
                fieldInfo.options = fieldConfig.select.options.map(opt => opt.name);
            }
            
            if (fieldConfig.type === 'multi_select' && fieldConfig.multi_select?.options) {
                fieldInfo.options = fieldConfig.multi_select.options.map(opt => opt.name);
            }
            
            fields.push(fieldInfo);
            
            console.log(`📌 ${fieldName}`);
            console.log(`   類型: ${fieldConfig.type}`);
            console.log(`   ID: ${fieldConfig.id}`);
            
            if (fieldInfo.options) {
                console.log(`   選項: ${fieldInfo.options.join(', ')}`);
            }
            
            console.log('');
        });
        
        return { name, databaseId, fields, rawData: database };
        
    } catch (error) {
        console.error(`❌ 檢查 ${name} 資料庫失敗:`, error.message);
        return null;
    }
}

async function generatePOSMappingConfig(structures) {
    console.log('\n🔧 生成 POS 系統映射配置...');
    console.log('='.repeat(60));
    
    const mappingConfig = {};
    
    structures.forEach(structure => {
        if (!structure) return;
        
        const mapping = {};
        
        structure.fields.forEach(field => {
            mapping[field.name] = {
                type: field.type,
                id: field.id
            };
            
            if (field.options) {
                mapping[field.name].options = field.options;
            }
        });
        
        mappingConfig[structure.name] = mapping;
    });
    
    console.log('📋 完整映射配置:');
    console.log(JSON.stringify(mappingConfig, null, 2));
    
    return mappingConfig;
}

async function main() {
    console.log('🚀 開始檢查 Notion 資料庫結構...');
    
    const structures = await Promise.all([
        checkDatabaseStructure(config.notion.databaseIds.tables, 'tables'),
        checkDatabaseStructure(config.notion.databaseIds.orders, 'orders'),
        checkDatabaseStructure(config.notion.databaseIds.menu, 'menu')
    ]);
    
    const mappingConfig = await generatePOSMappingConfig(structures);
    
    console.log('\n🎯 建議的 notion-manager.js 更新:');
    console.log('='.repeat(60));
    
    // 為每個資料庫生成映射代碼
    structures.forEach(structure => {
        if (!structure) return;
        
        console.log(`\n// ${structure.name.toUpperCase()} 資料庫映射`);
        console.log(`case '${structure.name}':`);
        
        structure.fields.forEach(field => {
            const dataField = `data.${field.name} || data.${field.name.toLowerCase()}`;
            
            switch (field.type) {
                case 'title':
                    console.log(`    properties.${field.name} = { title: [{ text: { content: ${dataField} || '' } }] };`);
                    break;
                case 'rich_text':
                    console.log(`    properties.${field.name} = { rich_text: [{ text: { content: ${dataField} || '' } }] };`);
                    break;
                case 'number':
                    console.log(`    properties.${field.name} = { number: ${dataField} || 0 };`);
                    break;
                case 'select':
                    console.log(`    properties.${field.name} = { select: { name: ${dataField} || '${field.options?.[0] || '預設'}' } };`);
                    break;
                case 'checkbox':
                    console.log(`    properties.${field.name} = { checkbox: ${dataField} || false };`);
                    break;
                case 'date':
                    console.log(`    if (${dataField}) {`);
                    console.log(`        properties.${field.name} = { date: { start: new Date(${dataField}).toISOString() } };`);
                    console.log(`    }`);
                    break;
                default:
                    console.log(`    // ${field.name}: ${field.type} - 需要手動處理`);
            }
        });
        
        console.log(`    break;\n`);
    });
    
    console.log('\n✅ 檢查完成！');
}

// 執行檢查
main().catch(console.error);
