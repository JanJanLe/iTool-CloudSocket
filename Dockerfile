FROM registry.cn-hangzhou.aliyuncs.com/newbe36524/aspnet:3.1-buster-slim

# °²×°nodejs
RUN sed -i 's#http://deb.debian.org#https://mirrors.aliyun.com#g' /etc/apt/sources.list
RUN apt-get update && apt-get install -y nodejs npm

WORKDIR /app
COPY . .

CMD ["-sql", "-rabbit", "-redis","-service", "-netty", "-heartbeat"]

ENTRYPOINT ["dotnet", "DotNetty.Main.dll"]