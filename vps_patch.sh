echo SPRING_JPA_HIBERNATE_DDL_AUTO=update >> /root/capnong/.env  
cd /root/capnong && docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d backend  
