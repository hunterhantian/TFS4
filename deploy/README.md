# 腾讯云运行配置

Stage1已部署至原腾讯云，入口：https://193.112.151.236/ 。实际核验、数据保护、证书及回退证据见[部署报告](../docs/腾讯云Stage1部署与基础存档核验.md)。

- `ruanshizi.service`：独立用户运行，仅127.0.0.1:4174。
- `nginx-ip.conf`：IP HTTPS、HTTP跳转、音频范围请求；其余路由由应用白名单处理。
- `ruanshizi-backup.service/timer`、`daily-backup.mjs`：上海自然日日备份，保留14个日备份；初始及发布前备份单独保留。
- `ruanshizi-cert-renew.service/timer`：每6小时检查IP证书，续期成功后重载Nginx。

代码`/opt/ruanshizi/current`；数据`/var/lib/ruanshizi/private`；备份`/var/backups/ruanshizi`；环境`/etc/ruanshizi/app.env`。私有文件不在Web目录。

```sh
sudo systemctl status ruanshizi --no-pager
sudo systemctl list-timers ruanshizi-backup.timer ruanshizi-cert-renew.timer
curl -fsS https://193.112.151.236/api/health
sudo systemctl start ruanshizi-backup.service
sudo /opt/ruanshizi/certbot/bin/certbot renew --dry-run --no-random-sleep-on-renew --run-deploy-hooks --deploy-hook '/usr/sbin/nginx -t && /usr/bin/systemctl reload nginx'
```

更新前生成一致备份并下载至本机，每次使用新发布目录。不覆盖生产数据库，恢复只能写入新目标。旧静态站保留，回退演练通过，但旧站不能提供云账号和存档功能。
