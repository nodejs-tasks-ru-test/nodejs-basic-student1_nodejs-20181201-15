if (process.env.CI)
  require('./run_tests_ci');
else
  require('./run_tests_local');