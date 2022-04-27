<template>
  <div class="py-3">
    <router-link :to="{ name: 'profileActivity' }" v-slot="{ isExactActive }">
      <BaseSidebarNavigationItem :isActive="isExactActive">
        {{ $t('profile.activity.header') }}
      </BaseSidebarNavigationItem>
    </router-link>
    <router-link :to="{ name: 'profileAbout' }" v-slot="{ isExactActive }">
      <BaseSidebarNavigationItem :isActive="isExactActive">
        {{ $t('profile.about.header') }}
      </BaseSidebarNavigationItem>
    </router-link>
  </div>
</template>
