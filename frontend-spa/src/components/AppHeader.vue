<template>
  <nav class="navbar navbar-expand bg-dark" data-bs-theme="dark">
    <div class="container-fluid">
      <a href="/" class="navbar-brand">Cinema </a>
      <div class="me-auto navbar-nav">
        <li class="nav-item">
          <router-link :to="{ name: '' }" class="nav-link">
            Cinema
            <i class="fas fa-address-book"> </i>
          </router-link>
        </li>
      </div>
    </div>
  </nav>
</template>