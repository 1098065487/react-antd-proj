<?php

namespace Deployer;

require __DIR__ . '/deployer/recipe/common.php';

// Project name
set('application', 'ErpV2-Frontend');

set('rsync_src', __DIR__ . '/dist');
set('rsync_timeout', 600);

// Hosts
host('leading.io')
    ->user('admin')
    ->identityFile('~/.ssh/id_rsa')
    ->addSshOption('StrictHostKeyChecking', 'no')
    ->stage('dev')
    ->set('deploy_path', '/home/service/storage/application/html/repo/{{application}}')
    ->set('docker_deploy_path', '/var/www/html/repo/{{application}}');

host('node1.aliyun.leadingtechgroup.com')
  ->user('admin')
  ->identityFile('~/.ssh/id_rsa')
  ->addSshOption('StrictHostKeyChecking', 'no')
  ->stage('prod')
  ->set('deploy_path', '/var/www/html/repository/erpv2/erpv2-frontend')
  ->set('writable_use_sudo', true);

// Tasks
desc('Deploy your project');
task('deploy', [
    'deploy:info',
    'deploy:prepare',
    'deploy:lock',
    'deploy:release',
    'rsync',
    'deploy:symlink',
    'deploy:unlock',
    'cleanup',
]);

// [Optional] if deploy fails automatically unlock.
after('deploy:failed', 'deploy:unlock');
