<template>
  <NMenu
    v-model:value="selectedKeys"
    :icon-size="22"
    :options="menus"
    :mode="mode"
    :collapsed="collapsed"
    :width="500"
    :indent="0"
    :root-indent="16"
    :accordion="true"
    @update:value="clickMenuItem"
    :default-value="defaultValue"
    :key="key_menu"
    :render-label="renderMenuLabel"
    class="menu_custom"
  />
</template>
<script>
import {
  defineComponent,
  ref,
  onMounted,
  reactive,
  computed,
  watch,
  toRefs,
  unref,
} from "vue";

export default defineComponent({
  name: "Menu",
  components: {},
  props: {
    mode: {
      type: String,
      default: "vertical",
    },
    collapsed: {
      type: Boolean,
    },
    location: {
      type: String,
      default: "left",
    },
    menus: {
      type: Array,
    },
    helps: {
      type: Number,
      default: 0,
    },
  },
  emits: ["update:collapsed", "clickMenuItem"],
  setup(props, { emit }) {
    const currentRoute = useRoute();
    const router = useRouter();
    const key_menu = ref(0);
    const menuInstRef = ref(null);

    function renderMenuLabel(option) {
      if (option.key == "help-center") {
        return h("div", { class: "flex items-center" }, [
          h(
            "span",
            {
              class:
                "transition-all-300 font-400 text-14px 2xl:font-500 2xl:text-15px ml-1",
            },
            [option.label],
          ),
          h(NBadge, { value: props.helps, max: 99, class: "ml-auto" }),
        ]);
      }
      return h(
        "div",
        {
          class:
            "transition-all-300 font-400 text-14px 2xl:font-500 2xl:text-15px ml-1",
        },
        [option.label],
      );
    }
    const computedKey = computed(() => {
      const noSubMenus = [
        "class/process/",
        "result/testlist",
        "result/attendance",
        "tuition-fee",
        "exam",
      ];

      const routePathArr = currentRoute.path.split("/");

      let parts;

      if (
        currentRoute.path !== "/finance/tuition-fee" &&
        noSubMenus.some((x) => currentRoute.path.includes(x))
      ) {
        parts = routePathArr[1];

        // If menu item is only 1 layer and route is detail with id, then menu is still shown selected
      } else if (routePathArr.length === 3 && currentRoute.params.id) {
        parts = routePathArr[1];
      } else {
        parts = currentRoute.path.split("/").slice(1, 3).join("/");
      }

      return !parts || parts === "callback" ? "dashboard" : parts;
    });
    const selectedKeys = ref(computedKey.value);
    const headerMenuSelectKey = ref("");
    const defaultValue = ref("");
    const getKey = currentRoute?.matched?.[0]?.path;
    if (getKey) {
      let parts = getKey.substring(1).split("/");
      if (
        parts[parts.length - 1] === "add" ||
        parts[parts.length - 1] === ":id" ||
        parts[parts.length - 1] === "import"
      ) {
        parts = parts.slice(0, -1); // Loại bỏ phần tử cuối cùng
      }
      const result = parts.join("/");
      defaultValue.value = result;
    }
    watch(
      () => computedKey.value,
      (newValue) => selectAndExpand(newValue),
    );

    const selectAndExpand = (key) => {
      selectedKeys.value = key;
      menuInstRef.value?.showOption(key);
    };

    watch(currentRoute, () => {
      const getKey = currentRoute?.matched?.[0]?.path;
      if (!getKey) return;

      let parts = getKey.substring(1).split("/");

      if (
        parts[parts.length - 1] === "add" ||
        parts[parts.length - 1] === ":id" ||
        parts[parts.length - 1] === "import"
      )
        parts = parts.slice(0, -1); // Loại bỏ phần tử cuối cùng

      let result = parts.join("/");
      defaultValue.value = result;
      key_menu.value++;
    });

    const matched = currentRoute.matched;
    const getOpenKeys =
      matched && matched.length ? matched.map((item) => item.name) : [];
    const state = reactive({
      openKeys: getOpenKeys,
    });
    const getSelectedKeys = computed(() => {
      let location = props.location;
      return location === "left" ||
        (location === "header" && unref(navMode) === "horizontal")
        ? unref(selectedKeys)
        : unref(headerMenuSelectKey);
    });

    watch(() => currentRoute.fullPath, updateMenu);

    function findPathByKey(data, idToFind, currentPath = []) {
      for (const item of data) {
        const path = [...currentPath, item];
        if (`/${item.key}` === idToFind) {
          return path;
        } else if (item.children) {
          const found = findPathByKey(item.children, idToFind, path);
          if (found) {
            return found;
          }
        }
      }
      return null;
    }

    function updateMenu() {
      const firstRouteName = currentRoute.matched[0].path || "";
      const path = findPathByKey(props.menus, firstRouteName);
      //   if (path) {
      //     state_breadcrumb.value = path;
      //   }
    }

    function clickMenuItem(key) {
      if (/http(s)?:/.test(key)) {
        window.open(key);
      } else {
        if (!key.startsWith("/")) key = `/${key}`;
        // check not default lang
        // if (currentLocale !== "vi") key = `${currentLocale}/${key}`
        router.push(key);
      }
    }

    function menuExpanded(openKeys) {
      if (!openKeys) return;
      const latestOpenKey = openKeys.find(
        (key) => state.openKeys.indexOf(key) === -1,
      );
      const isExistChildren = findChildrenLen(latestOpenKey);
      state.openKeys = isExistChildren
        ? latestOpenKey
          ? [latestOpenKey]
          : []
        : openKeys;
    }

    function findChildrenLen(key) {
      if (!key) return false;
      const subRouteChildren = [];
      for (const { children, key } of unref(props.menus)) {
        if (children && children.length) {
          subRouteChildren.push(key);
        }
      }
    }

    onMounted(updateMenu);

    return {
      ...toRefs(state),
      defaultValue,
      selectedKeys,
      headerMenuSelectKey,
      getSelectedKeys,
      clickMenuItem,
      menuExpanded,
      key_menu,
      renderMenuLabel,
      menuInstRef,
    };
  },
});
</script>
<style scoped>
.n-menu.n-menu--vertical.menu_custom {
  background-color: #fff;
}

* :deep(.n-menu-item-content--child-active::before) {
  background-color: #e6f7ff !important;
}
</style>

<style>
.n-menu .n-menu-item-content::before {
  left: 3px !important;
  right: 3px !important;
}

.n-menu
  > .n-menu-item
  .n-menu-item-content.n-menu-item-content--selected::before {
  background-color: #e6f7ff !important;
}

.n-menu
  > .n-menu-item
  .n-menu-item-content.n-menu-item-content--selected
  .n-menu-item-content-header {
  --n-item-text-color-active: #00a2eb !important;
  --n-item-text-color-active-hover: #00a2eb !important;
}

.no-fill > .nuxt-icon--fill,
.no-fill > .nuxt-icon--fill * {
  fill: none !important;
}

.no-fill > svg > path:last-child {
  fill: currentColor !important;
}
</style>
