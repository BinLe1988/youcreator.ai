'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, 
  Save, 
  Share, 
  Settings,
  PenTool,
  Palette,
  Music,
  Code,
  Sparkles,
  Send
} from 'lucide-react'

const modeConfig = {
  writing: {
    title: '智能写作',
    icon: PenTool,
    color: 'from-blue-500 to-cyan-500',
    placeholder: '开始你的创作...\n\n例如：写一个关于未来科技的短篇小说...'
  },
  painting: {
    title: 'AI绘画',
    icon: Palette,
    color: 'from-purple-500 to-pink-500',
    placeholder: '描述你想要生成的图像...\n\n例如：一个美丽的日落风景，有山脉和湖泊，油画风格...'
  },
  music: {
    title: '音乐创作',
    icon: Music,
    color: 'from-green-500 to-emerald-500',
    placeholder: '描述你想要的音乐风格...\n\n例如：一首轻松的爵士乐，适合咖啡厅的背景音乐...'
  },
  coding: {
    title: '代码编写',
    icon: Code,
    color: 'from-orange-500 to-red-500',
    placeholder: '描述你需要的代码功能...\n\n例如：用Python写一个计算斐波那契数列的函数...'
  }
}

export default function CreatePage() {
  const params = useParams()
  const router = useRouter()
  const mode = params.mode as string
  
  const [content, setContent] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedResult, setGeneratedResult] = useState('')

  const config = modeConfig[mode as keyof typeof modeConfig]

  useEffect(() => {
    if (!config) {
      router.push('/')
    }
  }, [config, router])

  if (!config) {
    return null
  }

  const handleGenerate = async () => {
    if (!content.trim()) return

    setIsGenerating(true)
    
    try {
      // 模拟AI生成过程
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // 根据不同模式生成不同的结果
      let result = ''
      switch (mode) {
        case 'writing':
          result = `基于您的提示"${content}"，AI生成的文本内容：\n\n在不远的未来，科技已经深度融入人类生活的每一个角落。智能助手不再只是简单的语音回复，而是能够理解人类情感、预测需求的伙伴。主人公李明是一名AI研究员，他正在开发一种全新的情感AI系统...`
          break
        case 'painting':
          result = '🎨 图像生成完成！\n\n根据您的描述，AI已经生成了一幅美丽的艺术作品。图像包含了您要求的所有元素：壮丽的日落、连绵的山脉和宁静的湖泊，采用了经典的油画风格。'
          break
        case 'music':
          result = '🎵 音乐创作完成！\n\n基于您的描述，AI创作了一首轻松的爵士乐曲。音乐采用了经典的4/4拍，包含钢琴主旋律、低音贝斯和轻柔的鼓点，非常适合作为咖啡厅的背景音乐。'
          break
        case 'coding':
          result = `💻 代码生成完成！\n\n\`\`\`python\ndef fibonacci(n):\n    \"\"\"\n    计算斐波那契数列的第n项\n    \"\"\"\n    if n <= 1:\n        return n\n    return fibonacci(n-1) + fibonacci(n-2)\n\n# 优化版本（使用动态规划）\ndef fibonacci_optimized(n):\n    if n <= 1:\n        return n\n    \n    a, b = 0, 1\n    for _ in range(2, n + 1):\n        a, b = b, a + b\n    return b\n\n# 测试\nprint(fibonacci_optimized(10))  # 输出: 55\n\`\`\``
          break
      }
      
      setGeneratedResult(result)
    } catch (error) {
      console.error('生成失败:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const Icon = config.icon

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="border-b border-gray-700 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/')}
                className="p-2 text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg bg-gradient-to-r ${config.color}`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-xl font-bold text-white">{config.title}</h1>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button className="p-2 text-gray-400 hover:text-white transition-colors">
                <Settings className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-white transition-colors">
                <Share className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-white transition-colors">
                <Save className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Panel */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Sparkles className="w-5 h-5 mr-2 text-yellow-400" />
                创作提示
              </h2>
              
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={config.placeholder}
                className="w-full h-64 bg-gray-900/50 border border-gray-600 rounded-lg p-4 text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              
              <div className="flex justify-between items-center mt-4">
                <span className="text-sm text-gray-400">
                  {content.length} 字符
                </span>
                
                <button
                  onClick={handleGenerate}
                  disabled={!content.trim() || isGenerating}
                  className={`
                    inline-flex items-center px-6 py-2 rounded-lg font-medium transition-all
                    ${content.trim() && !isGenerating
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700'
                      : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    }
                  `}
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      生成中...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      开始生成
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>

          {/* Output Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Icon className="w-5 h-5 mr-2" />
                生成结果
              </h2>
              
              <div className="min-h-64 bg-gray-900/50 border border-gray-600 rounded-lg p-4">
                {generatedResult ? (
                  <div className="text-white whitespace-pre-wrap">
                    {generatedResult}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    <div className="text-center">
                      <Icon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>在左侧输入创作提示，然后点击"开始生成"</p>
                    </div>
                  </div>
                )}
              </div>
              
              {generatedResult && (
                <div className="flex justify-end mt-4 space-x-2">
                  <button className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors">
                    重新生成
                  </button>
                  <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                    保存结果
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
