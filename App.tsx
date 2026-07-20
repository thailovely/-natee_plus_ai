@import "tailwindcss";

/* Base styles and custom scrollbars */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

@keyframes scrollUp {
  0% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(-50%);
  }
}

.animate-scroll-up {
  animation: scrollUp 20s linear infinite;
}

.animate-scroll-up:hover {
  animation-play-state: paused;
}

@media print {
  body {
    background-color: white !important;
    color: black !important;
  }
  /* Hide everything except the designated print area */
  body > div:not(.printable-area),
  #root > div:not(.printable-area),
  .no-print {
    display: none !important;
  }
  /* Make printable area visible and positioned at the top left */
  .printable-area {
    position: absolute;
    left: 0;
    top: 0;
    width: 100% !important;
    max-width: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
    border: none !important;
    box-shadow: none !important;
    display: block !important;
    visibility: visible !important;
  }
  .printable-area * {
    visibility: visible !important;
  }
}

