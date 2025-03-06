import { motion } from "framer-motion";

const ComingSoon = () => {
  return (
    <div className="w-[calc(100%-18rem)]">
           <div className="flex items-center justify-center min-h-screen bg-white"  style={{transform: "translate(-50%, -50%)", top: "50%", left: "60%", position:"absolute", }}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="text-center"
      >
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
          Coming Soon
        </h1>
        <p className="text-lg bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent mb-6">
          We're working on something amazing. Stay tuned!
        </p>
        <div className="flex items-center justify-center space-x-3">
          <div className="w-4 h-4 bg-indigo-500 rounded-full animate-bounce"></div>
          <div className="w-4 h-4 bg-purple-500 rounded-full animate-bounce delay-150"></div>
          <div className="w-4 h-4 bg-indigo-500 rounded-full animate-bounce delay-300"></div>
        </div>
      </motion.div>
    </div>
          </div>
  );
};

export default ComingSoon;
