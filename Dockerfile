FROM registry.cn-hangzhou.aliyuncs.com/newbe36524/aspnet:3.1-buster-slim

# °²×°nodejs
RUN sed -i 's#http://deb.debian.org#https://mirrors.aliyun.com#g' /etc/apt/sources.list
RUN apt-get update && apt-get install -y nodejs npm
RUN npm config set registry http://registry.npm.taobao.org/

RUN useradd -ms /bin/bash admin

WORKDIR /app
COPY . .

RUN chown -R admin:admin /app
RUN chmod 755 /app
USER admin


CMD ["-sql", "-rabbit", "-redis","-service", "-netty", "-heartbeat", "-host"]

ENTRYPOINT ["dotnet", "DotNetty.Main.dll"]