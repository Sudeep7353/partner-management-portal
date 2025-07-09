# ---------- STAGE 1: BUILD REACT APP ----------
    FROM node:22-alpine AS build_pmp_revamp_ui

    # Set environment to production
    ENV NODE_ENV=production
    WORKDIR /app
    
    # Build-time args
    ARG REACT_APP_PARTNER_MANAGER_API_BASE_URL
    ARG REACT_APP_POLICY_MANAGER_API_BASE_URL
    ARG PUBLIC_URL=/
    
    # Pass args as ENV vars
    ENV REACT_APP_PARTNER_MANAGER_API_BASE_URL=$REACT_APP_PARTNER_MANAGER_API_BASE_URL
    ENV REACT_APP_POLICY_MANAGER_API_BASE_URL=$REACT_APP_POLICY_MANAGER_API_BASE_URL
    ENV PUBLIC_URL=$PUBLIC_URL
    
    # Only copy what's needed to install dependencies
    COPY package*.json ./
    RUN npm ci --omit=dev
    
    # Copy app source
    COPY public ./public
    COPY src ./src
    COPY .env ./
    COPY craco.config.js .  # if you're using craco
    COPY tsconfig.json .    # if you're using TypeScript
    
    # Build the React app
    RUN npm run build
    
    
    # ---------- STAGE 2: SERVE WITH NGINX ----------
    FROM nginx:stable
    
    # Metadata labels
    ARG SOURCE
    ARG COMMIT_HASH
    ARG COMMIT_ID
    ARG BUILD_TIME
    
    LABEL source=${SOURCE}
    LABEL commit_hash=${COMMIT_HASH}
    LABEL commit_id=${COMMIT_ID}
    LABEL build_time=${BUILD_TIME}
    
    # Runtime envs
    ARG container_user=mosip
    ARG container_user_group=mosip
    ARG container_user_uid=1001
    ARG container_user_gid=1001
    ARG artifactory_url
    
    ENV artifactory_url_env=${artifactory_url}
    ENV nginx_dir=/usr/share/nginx
    ENV work_dir=${nginx_dir}/html
    ENV i18n_path=${work_dir}/i18n
    
    # Set working directory
    WORKDIR /home/${container_user}
    
    # Install OS packages and create user
    RUN apt-get -y update \
        && apt-get install -y unzip wget \
        && touch /var/run/nginx.pid \
        && groupadd -g ${container_user_gid} ${container_user_group} \
        && useradd -u ${container_user_uid} -g ${container_user_group} -s /bin/sh -m ${container_user} \
        && mkdir -p /var/run/nginx /var/tmp/nginx ${i18n_path} \
        && chown -R ${container_user}:${container_user} /usr/share/nginx /var/run/nginx /var/tmp/nginx ${i18n_path} /var/cache/nginx /var/log/nginx /var/run/nginx.pid
    
    # Copy configuration/start script
    ADD configure_start.sh configure_start.sh
    RUN chmod +x configure_start.sh
    
    # Copy nginx config
    COPY ./nginx/nginx.conf /etc/nginx/nginx.conf
    
    # Copy the build output from the first stage
    COPY --from=build_pmp_revamp_ui /app/build ${work_dir}
    
    # Create runtime env file inside container for React to read
    RUN echo "REACT_APP_PARTNER_MANAGER_API_BASE_URL=$REACT_APP_PARTNER_MANAGER_API_BASE_URL" >> ${work_dir}/env.env && \
        echo "REACT_APP_POLICY_MANAGER_API_BASE_URL=$REACT_APP_POLICY_MANAGER_API_BASE_URL" >> ${work_dir}/env.env
    
    # Set ownership
    RUN chown -R ${container_user}:${container_user} /home/${container_user} && \
        chown -R ${container_user}:${container_user} ${work_dir}
    
    # Use the created user
    USER ${container_user_uid}:${container_user_gid}
    
    # Expose app port
    EXPOSE 3000
    
    # Start script
    ENTRYPOINT ["./configure_start.sh"]
    CMD ["nginx", "-g", "daemon off;"]
    