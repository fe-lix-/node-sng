        location / {

            if ($uri ~ "\.php") {
                fastcgi_pass {{ php_bind }};
            }
            access_log  {{ tmpdir }}/access.log mine;
        }