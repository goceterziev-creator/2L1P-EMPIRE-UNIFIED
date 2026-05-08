// 🎯 ПЕТЯ AI КООРДИНАТОР - ГЛАВЕН МОЗЪК НА ИМПЕРИЯТА

class PetyaBrain {
    constructor() {
        this.agentType = "MASTER_COORDINATOR";
        this.skills = ["analysis", "coordination", "validation", "communication"];
        this.status = "ACTIVE";
        this.memory = [];
        this.tasks = [];
    }

    // 🔍 АНАЛИЗ НА ЗАЯВКИ
    analyzeRequest(userInput) {
        const analysis = {
            requestType: this.detectRequestType(userInput),
            urgency: this.detectUrgency(userInput),
            complexity: this.detectComplexity(userInput),
            requiredAgents: this.determineRequiredAgents(userInput),
            estimatedTime: this.estimateProcessingTime(userInput),
            keywords: this.extractKeywords(userInput),
            sentiment: this.analyzeSentiment(userInput)
        };
        
        this.memory.push({
            type: "analysis",
            input: userInput,
            result: analysis,
            timestamp: new Date()
        });
        
        return analysis;
    }

    // 🎯 ДЕТЕКТИРАНЕ НА ТИП ЗАЯВКА
    detectRequestType(input) {
        const patterns = {
            travel: /пътуване|полет|хотел|ваканция|почивка|рим|париж|истанбул|дестинация|екскурзия/i,
            payment: /плащане|пари|цена|такса|invoice|payment|карта|транзакция|евро|валута/i,
            support: /помощ|въпрос|проблем|съвет|информация|как да|къде да/i,
            technical: /код|програма|система|интеграция|api|bug|грешка|не работи/i,
            booking: /резервация|запазване|стаи|маса|час/i,
            complaint: /оплакване|лошо|счупено|недоволен|рекламация/i,
            feedback: /оценка|мнение|хареса|препоръка/i
        };

        for (const [type, pattern] of Object.entries(patterns)) {
            if (pattern.test(input)) return type;
        }
        return "general";
    }

    // ⚡ ДЕТЕКТИРАНЕ НА СЛОЖНОСТ
    detectComplexity(input) {
        const wordCount = input.split(/\s+/).length;
        const hasMultipleRequests = (input.match(/и|също|освен|също така|плюс/g) || []).length;
        const hasSpecificRequirements = (input.match(/искам|трябва|нуждая се|необходимо/g) || []).length;
        
        if (wordCount > 50 || hasMultipleRequests > 2 || hasSpecificRequirements > 3) return "HIGH";
        if (wordCount > 20 || hasMultipleRequests > 1) return "MEDIUM";
        return "LOW";
    }

    // 🔥 ДЕТЕКТИРАНЕ НА УРГЕНТНОСТ
    detectUrgency(input) {
        const urgentPatterns = /спешно|бързо|веднага|незабавно|важно|critical|urgent|бърза|сега/i;
        if (urgentPatterns.test(input)) return "HIGH";
        
        const timePatterns = /до часове|днес|утре|тази седмица/i;
        if (timePatterns.test(input)) return "MEDIUM";
        
        return "LOW";
    }

    // 🤖 ОПРЕДЕЛЯНЕ НА НЕОБХОДИМИ АГЕНТИ
    determineRequiredAgents(input) {
        const required = [];
        const type = this.detectRequestType(input);
        
        switch(type) {
            case "travel":
                required.push("travel-agent");
                if (input.match(/плащане|цена|пари/i)) required.push("payment-agent");
                if (input.match(/хотел|настаняване/i)) required.push("hospitality-agent");
                break;
            case "payment":
                required.push("payment-agent");
                if (input.match(/пътуване|полет/i)) required.push("travel-agent");
                if (input.match(/анализ|статистика/i)) required.push("analytics-agent");
                break;
            case "technical":
                required.push("analytics-agent");
                break;
            default:
                required.push("general-agent");
        }
        
        return required;
    }

    // ⏱️ ОЦЕНКА НА ВРЕМЕ ЗА ОБРАБОТКА
    estimateProcessingTime(analysis) {
        let baseTime = 5; // секунди
        
        if (analysis.complexity === "HIGH") baseTime *= 3;
        if (analysis.complexity === "MEDIUM") baseTime *= 1.5;
        if (analysis.urgency === "HIGH") baseTime *= 0.5;
        
        return Math.round(baseTime);
    }

    // 📝 ИЗВЛИЧАНЕ НА КЛЮЧОВИ ДУМИ
    extractKeywords(input) {
        const words = input.split(/\s+/);
        const stopWords = ['и', 'на', 'в', 'за', 'от', 'с', 'до', 'че', 'като', 'което'];
        
        return words
            .map(w => w.toLowerCase().replace(/[.,!?]/g, ''))
            .filter(w => w.length > 2 && !stopWords.includes(w));
    }

    // 😊 АНАЛИЗ НА СЕНТИМЕНТ
    analyzeSentiment(input) {
        const positiveWords = /благодаря|супер|чудесно|страхотно|доволен|харесва|отлично|перфектно/i;
        const negativeWords = /лошо|ужасно|глупаво|не работи|проблем|грешка|оплакване|възмутен/i;
        
        if (positiveWords.test(input)) return "POSITIVE";
        if (negativeWords.test(input)) return "NEGATIVE";
        return "NEUTRAL";
    }

    // 🚀 СТАРТИРАНЕ НА КООРДИНАЦИЯ
    async coordinateTask(task) {
        console.log(`🎯 ПЕТЯ започва координация на: ${task.type}`);
        
        const taskId = this.generateTaskId();
        this.tasks.push({
            id: taskId,
            task: task,
            status: "IN_PROGRESS",
            startTime: new Date()
        });
        
        // 1. Анализ на задачата
        const analysis = this.analyzeRequest(task.input);
        
        // 2. Определяне на необходимите агенти
        const requiredAgents = this.determineRequiredAgents(task.input);
        
        // 3. Създаване на workflow
        const workflow = {
            id: taskId,
            task: task,
            analysis: analysis,
            agents: requiredAgents,
            steps: this.createWorkflowSteps(analysis, requiredAgents),
            timeline: this.createTimeline(analysis)
        };
        
        return {
            success: true,
            workflow: workflow,
            message: "✅ ПЕТЯ успешно координира задачата"
        };
    }

    // 📋 СЪЗДАВАНЕ НА WORKFLOW СТЪПКИ
    createWorkflowSteps(analysis, agents) {
        const steps = [];
        
        // Стъпка 1: Разпределение
        steps.push({
            step: 1,
            action: "DISTRIBUTE",
            to: agents,
            status: "PENDING"
        });
        
        // Стъпка 2: Обработка
        steps.push({
            step: 2,
            action: "PROCESS",
            by: agents,
            estimatedTime: analysis.estimatedTime,
            status: "PENDING"
        });
        
        // Стъпка 3: Валидация
        steps.push({
            step: 3,
            action: "VALIDATE",
            by: "PETYA",
            status: "PENDING"
        });
        
        // Стъпка 4: Отговор
        steps.push({
            step: 4,
            action: "RESPOND",
            to: "USER",
            status: "PENDING"
        });
        
        return steps;
    }

    // ⏰ СЪЗДАВАНЕ НА ВРЕМЕВА ЛИНИЯ
    createTimeline(analysis) {
        const now = new Date();
        const timeline = {
            start: now,
            distribution: new Date(now.getTime() + 1000),
            processing: new Date(now.getTime() + (analysis.estimatedTime * 1000)),
            validation: new Date(now.getTime() + (analysis.estimatedTime * 1000) + 2000),
            response: new Date(now.getTime() + (analysis.estimatedTime * 1000) + 3000)
        };
        
        return timeline;
    }

    // 🔢 ГЕНЕРИРАНЕ НА ID
    generateTaskId() {
        return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // 📊 ПОЛУЧАВАНЕ НА СТАТИСТИКА
    getStats() {
        return {
            totalTasks: this.tasks.length,
            completedTasks: this.tasks.filter(t => t.status === "COMPLETED").length,
            inProgressTasks: this.tasks.filter(t => t.status === "IN_PROGRESS").length,
            averageComplexity: this.calculateAverageComplexity(),
            memorySize: this.memory.length
        };
    }

    // 📈 КАЛКУЛИРАНЕ НА СРЕДНА СЛОЖНОСТ
    calculateAverageComplexity() {
        const complexities = this.memory
            .filter(m => m.type === "analysis")
            .map(m => m.result.complexity === "HIGH" ? 3 : m.result.complexity === "MEDIUM" ? 2 : 1);
        
        if (complexities.length === 0) return 0;
        const avg = complexities.reduce((a, b) => a + b, 0) / complexities.length;
        return Math.round(avg * 10) / 10;
    }
}

// 🎯 ЕКСПОРТ
window.PetyaBrain = PetyaBrain;
console.log("✅ ПЕТЯ AI КООРДИНАТОР ЗАРЕДЕН!"); 
