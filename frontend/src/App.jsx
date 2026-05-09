import { AnimatePresence, motion } from 'framer-motion';
import { AppRoutes } from './routes/AppRoutes';

function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 antialiased">
      <AnimatePresence mode="wait">
        <motion.div
          key="app"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25 }}
          className="relative"
        >
          <AppRoutes />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default App;
