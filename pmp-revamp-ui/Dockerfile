# ---------- BUILD STAGE ----------
    FROM node:22-alpine as build_pmp_revamp_ui

    # Set production environment
    ENV NODE_ENV production
    
    # Build-time arguments for React app config
    ARG REACT_APP_PARTNER_MANAGER_API_BASE_URL
    ENV REACT_APP_PARTNER_MANAGER_API_BASE_URL $REACT_APP_PARTNER_MANAGER_API_BASE_URL
    
    ARG REACT_APP_POLICY_MANAGER_API_BASE_URL
    ENV REACT_APP_POLICY_MANAGER_API_BASE_URL $REACT_APP_POLICY_MANAGER_API_BASE_URL
    
    # Set public URL for React
    ENV PUBLIC_URL=_PUBLIC_URL_
    
    # Set working directory for better cache reuse and cleanliness
    WORKDIR /app  # ✅ Added: keeps build context organized, improves cache hit rate
    
    # Copy only dependency files first to leverage Docker layer caching
    COPY package*.json ./  # ✅ Optimization: only copy what's needed to install dependencies
    RUN npm install        # ✅ Kept: essential to install dependencies
    
    # Copy the remaining app source files
    COPY . ./  # ✅ Kept: full source needed to build
    
    # Build the React app
    RUN npm run build  # ✅ Kept: necessary build step
    
    # ---------- RUNTIME STAGE ----------
    FROM nginx:stable
    
    # Metadata for image traceability
    ARG SOURCE
    ARG COMMIT_HASH
    ARG COMMIT_ID
    ARG BUILD_TIME
    LABEL source=${SOURCE}
    LABEL commit_hash=${COMMIT_HASH}
    LABEL commit_id=${COMMIT_ID}
    LABEL build_time=${BUILD_TIME}
    
    # User and group config (build-time args)
    ARG container_user=mosip
    ARG container_user_group=mosip
    ARG container_user_uid=1001
    ARG container_user_gid=1001
    
    # Artifactory URL (optional)
    ARG artifactory_url
    ENV artifactory_url_env=${artifactory_url}
    
    # Define Nginx-related environment variables
    ENV nginx_dir=/usr/share/nginx
    ENV work_dir=${nginx_dir}/html
    ENV i18n_path=${work_dir}/i18n
    
    # Set working directory for the container user
    WORKDIR /home/${container_user}
    
    # Install OS packages and configure user
    RUN apt-get -y update \
        && apt-get install -y unzip wget \
        && touch /var/run/nginx.pid \
        && groupadd -g ${container_user_gid} ${container_user_group} \
        && useradd -u ${container_user_uid} -g ${container_user_group} -s /bin/sh -m ${container_user} \
        && mkdir -p /var/run/nginx /var/tmp/nginx ${i18n_path} \
        && chown -R ${container_user}:${container_user} /usr/share/nginx /var/run/nginx /var/tmp/nginx ${i18n_path} /var/cache/nginx /var/log/nginx /var/run/nginx.pid
        # ✅ Kept as-is: Required for permission and runtime setup
    
    # Add and configure the startup script
    ADD configure_start.sh configure_start.sh
    RUN chmod +x configure_start.sh  # ✅ Kept: Required to execute entrypoint
    
    # Copy Nginx configuration
    COPY ./nginx/nginx.conf /etc/nginx/nginx.conf  # ✅ Kept: Required for Nginx setup
    
    # Copy React build output to nginx html directory
    COPY --from=build_pmp_revamp_ui /app/build ${work_dir}  # ✅ CHANGED: Fixed incorrect path `/build` → `/app/build` to match WORKDIR in build stage
    
    # Inject runtime environment variables to a file React can read
    RUN echo "REACT_APP_PARTNER_MANAGER_API_BASE_URL=$REACT_APP_PARTNER_MANAGER_API_BASE_URL" >> ${work_dir}/env.env && \
        echo "REACT_APP_POLICY_MANAGER_API_BASE_URL=$REACT_APP_POLICY_MANAGER_API_BASE_URL" >> ${work_dir}/env.env
        # ✅ Combined into single RUN to reduce image layer and speed up build
    
    # Fix ownership of application directory
    RUN chown -R ${container_user}:${container_user} /home/${container_user} && \
        chown -R ${container_user}:${container_user} ${work_dir}
        # ✅ Combined into single RUN to optimize layer count and build time
    
    # Use unprivileged container user
    USER ${container_user_uid}:${container_user_gid}
    
    # Expose application port
    EXPOSE 3000
    
    # Entrypoint script for environment setup
    ENTRYPOINT ["./configure_start.sh"]
    
    # Start nginx in background (required by your original logic)
    CMD echo "starting nginx" ; \
        nginx ; \
        sleep infinity
    