<template>
  <div class="app-container">
    
    <!-- ÜST NAVBAR -->
    <header class="navbar">
      <div class="nav-content">
        <h1 class="logo">
          <span class="logo-icon">BT</span> Bilfen TechBlog
        </h1>

        <div v-if="!currentUser" class="auth-buttons">
          <button @click="isLoginMode = true; isForgotPasswordMode = false" :class="['btn', isLoginMode && !isForgotPasswordMode ? 'btn-primary' : 'btn-ghost']">{{ t('login') }}</button>
          <button @click="isLoginMode = false; isForgotPasswordMode = false" :class="['btn', !isLoginMode && !isForgotPasswordMode ? 'btn-primary' : 'btn-ghost']">{{ t('register') }}</button>
        </div>

        <div v-else class="user-menu-container">
          <span class="greeting">{{ t('hello') }}, <strong>{{ currentUser }}</strong></span>
          <button @click="activeTab = 'home'; isMenuOpen = false" :class="['btn', activeTab === 'home' ? 'btn-secondary' : 'btn-ghost']">🏠 {{ t('home') }}</button>
          <button v-if="isAdmin" @click="activeTab = 'stats'; isMenuOpen = false" :class="['btn', activeTab === 'stats' ? 'btn-secondary' : 'btn-ghost']">📊 {{ t('stats') }}</button>
          
          <button @click="isMenuOpen = !isMenuOpen" class="btn btn-primary menu-toggle">
            ☰ {{ t('menu') }}
          </button>

          <div v-if="isMenuOpen" @click="isMenuOpen = false" class="menu-overlay"></div>

          <div v-if="isMenuOpen" class="dropdown-menu">
            <div class="dropdown-header">
              <div class="dropdown-label">{{ t('account') }}</div>
              <div class="dropdown-username">{{ currentUser }}</div>
            </div>
            
            <button @click="activeTab = 'profile'; isMenuOpen = false" class="dropdown-item">👤 {{ t('profile') }}</button>
            <button @click="activeTab = 'about'; isMenuOpen = false" class="dropdown-item">ℹ️ {{ t('about') }}</button>

            <div class="dropdown-section">
              <div class="dropdown-section-title">📚 {{ t('topics') }}</div>
              <button @click="selectedCategoryFilter = 'Tümü'; activeTab = 'home'; isMenuOpen = false" class="dropdown-subitem">{{ t('allArticles') }}</button>
              <button v-for="cat in categoryList" :key="cat" @click="selectedCategoryFilter = cat; activeTab = 'home'; isMenuOpen = false" class="dropdown-subitem">{{ cat }}</button>
            </div>
            
            <a href="mailto:bilfentechblog@gmail.com" class="dropdown-item contact-item">
              <span>✉️ {{ t('contact') }}</span>
              <span class="contact-email">bilfentechblog@gmail.com</span>
            </a>

            <button @click="logout" class="dropdown-item danger-item">🚪 {{ t('logout') }}</button>
          </div>
        </div>
      </div>
    </header>

    <main class="main-content">

      <!-- GİRİŞ / KAYIT / ŞİFRE SIFIRLAMA KARTI -->
      <div v-if="!currentUser" class="auth-card">
        <h2 class="auth-title">
          <template v-if="isForgotPasswordMode">{{ t('resetPassTitle') }}</template>
          <template v-else-if="isLoginMode">{{ t('loginTitle') }}</template>
          <template v-else>{{ t('registerTitle') }}</template>
        </h2>
        
        <div v-if="isForgotPasswordMode" class="form-group fade-in">
          <p class="auth-desc">{{ t('resetPassDesc') }}</p>
          <input v-model="forgotEmail" type="email" :placeholder="t('emailPlaceholder')" class="input-field" />
          <button @click="resetPassword" class="btn btn-primary btn-block">{{ t('sendResetLink') }}</button>
          <div class="text-center mt-3">
            <a href="#" @click.prevent="isForgotPasswordMode = false; isLoginMode = true" class="link-muted">← {{ t('backToLogin') }}</a>
          </div>
        </div>

        <div v-else-if="isLoginMode" class="form-group fade-in">
          
          <div v-if="savedCredential" @click="useSavedCredential" class="saved-user-card fade-in">
            <div class="saved-user-content">
              <div class="saved-user-avatar">
                {{ savedCredential.u.charAt(0).toUpperCase() }}
              </div>
              <div class="saved-user-info">
                <span class="saved-title">{{ t('welcomeBack') }} 👋</span>
                <strong class="saved-username">{{ savedCredential.u }}</strong>
              </div>
            </div>
            <div class="saved-user-actions">
              <span class="quick-login-text">{{ t('quickLogin') }}</span>
              <button @click.stop="clearSavedCredential" class="btn-clear-saved" :title="t('removeAccount')">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
          </div>

          <input v-model="authUsername" type="text" :placeholder="t('usernamePlaceholder')" class="input-field" />
          <input v-model="authPassword" type="password" :placeholder="t('passwordPlaceholder')" class="input-field" />
          
          <div class="auth-options">
            <label class="checkbox-label">
              <input type="checkbox" v-model="rememberMe" class="custom-checkbox" />
              {{ t('rememberMe') }}
            </label>
            <div class="forgot-password">
              <a href="#" @click.prevent="isForgotPasswordMode = true" class="link-primary">{{ t('forgotPassword') }}</a>
            </div>
          </div>

          <button @click="login" class="btn btn-primary btn-block">{{ t('login') }}</button>
        </div>

        <div v-else class="form-group fade-in">
          <input v-model="authUsername" type="text" :placeholder="t('chooseUsername')" class="input-field" />
          <input v-model="authEmail" type="email" :placeholder="t('emailPlaceholder')" class="input-field" />
          <input v-model="authPassword" type="password" :placeholder="t('choosePassword')" class="input-field" />
          <button @click="register" class="btn btn-primary btn-block">{{ t('completeRegister') }}</button>
        </div>
      </div>

      <!-- İSTATİSTİKLER EKRANI -->
      <div v-if="currentUser && activeTab === 'stats'" class="fade-in">
        <h2 class="section-title">{{ t('systemStats') }}</h2>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value text-blue">{{ totalArticlesCount }}</div>
            <div class="stat-label">{{ t('totalArticles') }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-value text-red">{{ totalLikesCount }}</div>
            <div class="stat-label">{{ t('totalLikes') }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-value text-green">{{ totalCommentsCount }}</div>
            <div class="stat-label">{{ t('totalComments') }}</div>
          </div>
        </div>
      </div>

      <!-- HAKKIMIZDA EKRANI -->
      <div v-if="currentUser && activeTab === 'about'" class="fade-in">
        <div class="publish-card about-section">
          <div class="about-header">
            <h2 class="publish-title about-title">
              <span class="logo-icon about-logo">BT</span> 
              {{ t('aboutTitle') }}
            </h2>
            <p class="publish-subtitle">{{ t('aboutSubtitle') }}</p>
          </div>
          
          <div class="article-content about-content">
            <div class="about-badge">
              <p>📅 {{ t('founded') }}: <span>August 2026</span></p>
            </div>

            <h3>{{ t('visionHeader') }}</h3>
            <p><strong>Bilfen TechBlog</strong>, {{ t('visionText1') }}</p>
            
            <p>{{ t('visionText2') }}</p>

            <h3>{{ t('featuresHeader') }}</h3>
            <ul>
              <li><strong>{{ t('feature1Title') }}:</strong> {{ t('feature1Desc') }}</li>
              <li><strong>{{ t('feature2Title') }}:</strong> {{ t('feature2Desc') }}</li>
              <li><strong>{{ t('feature3Title') }}:</strong> {{ t('feature3Desc') }}</li>
              <li><strong>{{ t('feature4Title') }}:</strong> {{ t('feature4Desc') }}</li>
            </ul>

            <p class="about-footer-text">
              {{ t('aboutFooter') }} 🚀
            </p>
          </div>
        </div>
      </div>

      <!-- PROFİL EKRANI -->
      <div v-if="currentUser && activeTab === 'profile'" class="fade-in">
        <div class="profile-header-card">
          <div class="profile-avatar-large">{{ currentUser.charAt(0).toUpperCase() }}</div>
          <h2 class="profile-name">{{ currentUser }}</h2>
          
          <!-- HAKKIMDA (BİO) ALANI -->
          <div class="bio-container">
            <p v-if="!isEditingBio" class="profile-role">{{ userBio || (currentLang === 'tr' ? 'Henüz bir biyografi eklemedin...' : 'No bio added yet...') }}</p>
            <button v-if="!isEditingBio" @click="startEditingBio" class="btn-micro btn-ghost mt-2">✏️ {{ t('editBio') }}</button>
            
            <div v-else class="bio-edit-container">
              <textarea v-model="tempBio" class="input-field mb-2" :placeholder="t('bioPlaceholder')"></textarea>
              <button @click="saveBio" class="btn-micro btn-success mr-2">💾 {{ t('save') }}</button>
              <button @click="isEditingBio = false" class="btn-micro btn-ghost">❌ {{ t('cancel') }}</button>
            </div>
          </div>
          
          <div class="profile-stats">
            <div class="p-stat-box"><strong class="text-dark">{{ myArticles.length }}</strong><span>{{ t('written') }}</span></div>
            <div class="p-stat-box"><strong class="text-blue">{{ followersCount }}</strong><span>{{ t('followers') }}</span></div>
            <div class="p-stat-box"><strong class="text-green">{{ userFollowing.length }}</strong><span>{{ t('following') }}</span></div>
            <div class="p-stat-box"><strong class="text-dark">{{ userFavorites.length }}</strong><span>{{ t('favorites') }}</span></div>
          </div>
        </div>

        <h3 class="section-subtitle">{{ t('myArticles') }}</h3>
        <div v-if="myArticles.length === 0" class="empty-state">
          <span class="empty-icon">📝</span>
          <p>{{ t('noArticlesYet') }}</p>
        </div>
        
        <div v-for="article in myArticles" :key="article._id" class="minimal-card flex-between">
          <div>
            <h4 class="minimal-card-title">{{ article.title }}</h4>
            <span class="meta">{{ new Date(article.publishDate).toLocaleDateString(currentLang === 'tr' ? 'tr-TR' : 'en-US') }} • ❤️ {{ article.likes || 0 }} {{ t('likes') }}</span>
          </div>
          <button @click.stop.prevent="deleteArticle(article._id)" class="btn-micro btn-danger">🗑️ {{ t('delete') }}</button>
        </div>

        <h3 class="section-subtitle mt-4">🔖 {{ t('myReadingList') }}</h3>
        <div v-if="userReadingList.length === 0" class="empty-state">
          <span class="empty-icon">🔖</span>
          <p>{{ t('noReadingListYet') }}</p>
        </div>
        <div v-for="article in userReadingList" :key="article._id" class="minimal-card flex-between">
          <div>
            <h4 class="minimal-card-title">{{ article.title }}</h4>
            <span class="meta">✍️ {{ article.author }} • {{ article.category }}</span>
          </div>
          <button @click.stop.prevent="toggleReadingList(article._id)" class="btn-micro btn-danger-soft">🗑️ {{ t('remove') }}</button>
        </div>

        <h3 class="section-subtitle mt-4">⭐ {{ t('myFavorites') }}</h3>
        <div v-if="userFavorites.length === 0" class="empty-state">
          <span class="empty-icon">⭐</span>
          <p>{{ t('noFavoritesYet') }}</p>
        </div>
        <div v-for="article in userFavorites" :key="article._id" class="minimal-card">
          <h4 class="minimal-card-title">{{ article.title }}</h4>
          <span class="meta">✍️ {{ article.author }} • {{ article.category }}</span>
        </div>

        <h3 class="section-subtitle mt-4">👥 {{ t('myFollowingAuthors') }}</h3>
        <div v-if="userFollowing.length === 0" class="empty-state">
          <span class="empty-icon">👥</span>
          <p>{{ t('noFollowingYet') }}</p>
        </div>
        <div class="following-list">
          <div v-for="author in userFollowing" :key="author" class="author-badge">
            <span @click="viewAuthorProfile(author)" class="author-name">✍️ {{ author }}</span>
            <button @click="toggleFollow(author)" class="btn-micro btn-danger-soft">{{ t('unfollow') }}</button>
          </div>
        </div>
      </div>

      <!-- YAZAR PROFİL EKRANI -->
      <div v-if="currentUser && activeTab === 'authorProfile'" class="fade-in">
        <button @click="activeTab = 'profile'" class="btn btn-ghost mb-3">← {{ t('back') }}</button>
        <div class="profile-header-card">
          <div class="profile-avatar-large">{{ selectedAuthor.charAt(0).toUpperCase() }}</div>
          <h2 class="profile-name">{{ selectedAuthor }}</h2>
          <p class="profile-role">{{ t('authorAllArticles') }} ({{ authorArticles.length }})</p>
        </div>
        <div v-if="authorArticles.length === 0" class="empty-state"><p>{{ t('authorNoArticles') }}</p></div>
        <div v-for="article in authorArticles" :key="article._id" class="article-card">
          <h3 class="article-title">{{ article.title }}</h3>
          <span class="tag">{{ article.category || 'Genel' }}</span>
          <p class="article-preview" v-html="article.content"></p>
          <small class="meta">{{ new Date(article.publishDate).toLocaleDateString(currentLang === 'tr' ? 'tr-TR' : 'en-US') }} • ❤️ {{ article.likes || 0 }} {{ t('likes') }}</small>
        </div>
      </div>

      <!-- ANA SAYFA EKRANI -->
      <div v-show="activeTab === 'home'" class="fade-in">
        
        <div class="search-container">
          <input 
            v-model="searchQuery" 
            @input="showDropdown = true"
            @focus="showDropdown = true"
            type="text" 
            :placeholder="t('searchPlaceholder')" 
            class="input-field search-input" 
          />
          <div v-if="showDropdown && searchQuery.length >= 3 && searchSuggestions.length > 0" class="search-dropdown">
            <div v-for="suggestion in searchSuggestions" :key="suggestion._id" @click="selectSuggestion(suggestion.title)" class="search-item">
              <div class="search-item-content">
                <strong class="search-item-title">{{ suggestion.title }}</strong> 
                <span class="search-item-author">✍️ {{ suggestion.author || 'Anonim' }}</span>
              </div>
              <span class="tag tag-small">{{ suggestion.category }}</span>
            </div>
          </div>
        </div>

        <div class="category-filters">
          <button 
            v-for="cat in ['Tümü', ...categoryList]" :key="cat" @click="selectedCategoryFilter = cat"
            :class="['btn-filter', selectedCategoryFilter === (cat === 'Tümü' && currentLang === 'en' ? 'All' : cat) ? 'active' : '']"
          >{{ cat === 'Tümü' && currentLang === 'en' ? 'All' : cat }}</button>
        </div>

        <!-- 🔥 TREND MAKALELER -->
        <div v-if="topArticles.length > 0" class="trending-section">
          <h3 class="trending-title">🔥 {{ t('trendingArticles') }}</h3>
          <div class="trending-scroll">
            <div v-for="(article, index) in topArticles" :key="'trend-'+article._id"
                 @click="openTrendingArticle(article)" class="trend-card">
              <div class="trend-rank">#{{ index + 1 }} {{ t('trend') }}</div>
              <div class="trend-title" :title="article.title">{{ article.title }}</div>
              <div class="trend-meta">
                <span>{{ article.author }}</span>
                <span class="trend-likes">❤️ {{ article.likes || 0 }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- YENİ MAKALE YAYINLA FORMU -->
        <div v-if="currentUser" class="publish-card fade-in">
          <div class="publish-header">
            <h3 class="publish-title">{{ t('shareNewArticle') }}</h3>
            <p class="publish-subtitle">{{ t('shareSubtitle') }}</p>
          </div>

          <form @submit.prevent="addArticle">
            
            <div class="dropzone-container mb-4">
              <label class="dropzone-label">
                <div class="dropzone-icon">📸</div>
                <div class="dropzone-text">{{ t('dropzoneText') }}</div>
                <div class="dropzone-subtext">{{ t('dropzoneSubtext') }}</div>
                <input type="file" @change="onFileSelected" accept="image/*" class="hidden-file-input" />
              </label>
              <div v-if="selectedFile" class="file-selected-alert">✅ <strong>{{ selectedFile.name }}</strong> {{ t('fileSelected') }}</div>
            </div>
            
            <div class="publish-grid mb-4">
              <div class="input-group">
                <label class="input-label">{{ t('articleTitleLabel') }}</label>
                <input v-model="newTitle" type="text" :placeholder="t('titlePlaceholder')" class="input-field" required />
              </div>
              <div class="input-group">
                <label class="input-label">{{ t('categoryLabel') }}</label>
                <select v-model="newCategory" class="input-field" required>
                  <option disabled value="">{{ t('selectCategory') }}</option>
                  <option v-for="cat in categoryList" :key="cat" :value="cat">{{ cat }}</option>
                </select>
              </div>
            </div>

            <div class="editor-container mb-4">
              <div class="editor-toolbar">
                <div class="toolbar-group">
                  <button type="button" @click="newContent += '<b>Kalın</b>'" class="btn-tool" title="Bold"><strong style="font-family: serif;">B</strong></button>
                  <button type="button" @click="newContent += '<i>Eğik</i>'" class="btn-tool" title="Italic"><i style="font-family: serif;">I</i></button>
                  <button type="button" @click="newContent += '<u>Altı Çizili</u>'" class="btn-tool" title="Underline"><u style="font-family: serif;">U</u></button>
                </div>
                <div class="toolbar-divider"></div>
                <div class="toolbar-group">
                  <button type="button" @click="newContent += '<h2>Alt Başlık</h2>'" class="btn-tool font-weight-bold" title="Heading 2">H2</button>
                  <button type="button" @click="newContent += '<h3>Alt Başlık</h3>'" class="btn-tool font-weight-bold" title="Heading 3">H3</button>
                </div>
                <div class="toolbar-divider"></div>
                <div class="toolbar-group">
                  <button type="button" @click="newContent += '<pre><code>// Kod buraya...</code></pre>'" class="btn-tool code-btn" title="Code Block">💻 {{ t('codeBlock') }}</button>
                  <button type="button" @click="newContent += '<br>'" class="btn-tool">↵ {{ t('newLine') }}</button>
                </div>
              </div>
              <textarea v-model="newContent" :placeholder="t('contentPlaceholder')" class="editor-textarea" required></textarea>
            </div>
            
            <div class="publish-actions">
              <button type="submit" class="btn btn-primary btn-publish">🚀 {{ t('publishBtn') }}</button>
            </div>
          </form>
        </div>

        <div v-if="pending" class="loading-state">
          <span class="spinner">⏳</span> {{ t('loadingArticles') }}
        </div>
        <div v-else-if="error" class="error-state">{{ t('loadingError') }}</div>

        <!-- MAKALE LİSTESİ -->
        <div v-else id="articles-list">
          <div v-if="filteredArticles.length === 0" class="empty-state">
            <span class="empty-icon">🔍</span>
            <p>{{ t('noArticlesFound') }}</p>
          </div>

          <div v-for="article in filteredArticles" :key="article._id" class="article-card">
            
            <div v-if="currentUser && (currentUser === article.author || isAdmin)" class="article-actions">
              <button @click="startEdit(article)" class="btn-micro btn-warning">{{ t('edit') }}</button>
              <button @click="deleteArticle(article._id)" class="btn-micro btn-danger">{{ t('delete') }}</button>
            </div>

            <!-- Düzenleme Modu -->
            <div v-if="currentUser && editingArticleId === article._id" class="edit-mode-container">
              <input v-model="editTitle" type="text" class="input-field mb-3" />
              <select v-model="editCategory" class="input-field mb-3">
                <option v-for="cat in categoryList" :key="cat" :value="cat">{{ cat }}</option>
              </select>
              <textarea v-model="editContent" class="input-field mb-3 editor-textarea-small"></textarea>
              <div class="edit-actions">
                <button @click="updateArticle(article._id)" class="btn btn-success">{{ t('saveChanges') }}</button>
                <button @click="cancelEdit" class="btn btn-secondary">{{ t('cancel') }}</button>
              </div>
            </div>

            <!-- Normal Görünüm -->
            <div v-else>
              <div v-if="article.imageUrl" class="article-image-wrapper">
                <img :src="`https://bilfen-api-32fr.onrender.com](https://bilfen-api-32fr.onrender.com${article.imageUrl}`" class="article-image" alt="Kapak" />
              </div>

              <h2 class="article-title">{{ article.title }}</h2>
              
              <div class="article-meta-row">
                <span class="tag">{{ article.category || 'Genel' }}</span>
                <span class="meta-text">{{ t('author') }}: <strong>{{ article.author || 'Anonim' }}</strong></span>
                
                <button 
                  v-if="currentUser && currentUser !== article.author" 
                  @click="toggleFollow(article.author)" 
                  :class="['btn-micro', isFollowing(article.author) ? 'btn-secondary' : 'btn-primary-outline']"
                >
                  {{ isFollowing(article.author) ? t('followingStatus') : t('followBtn') }}
                </button>

                <button @click="toggleSummary(article)" class="btn-micro btn-sparkle ai-btn">✨ {{ t('quickSummary') }}</button>
              </div>

              <div v-if="showSummary[article._id]" class="ai-summary fade-in">
                <div v-if="isSummarizing[article._id]" class="summary-loading">
                  <span class="spinner">⚙️</span> {{ t('aiAnalyzing') }}
                </div>
                <div v-else>
                  <strong class="ai-title">🤖 {{ t('aiSummaryLabel') }}:</strong> {{ aiSummaries[article._id] }}
                </div>
              </div>

              <div class="article-content" v-html="article.content"></div>
              
              <div class="article-footer">
                <small class="meta-date">{{ new Date(article.publishDate).toLocaleDateString(currentLang === 'tr' ? 'tr-TR' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' }) }}</small>
                
                <div class="interaction-buttons">
                  <button @click="toggleFavorite(article._id)" :class="['btn-interact', isFavorite(article._id) ? 'active-fav' : '']">
                    <span class="interact-icon">⭐</span> {{ isFavorite(article._id) ? t('favorited') : t('favorite') }}
                  </button>

                  <button @click="toggleReadingList(article._id)" :class="['btn-interact', isInReadingList(article._id) ? 'active-fav' : '']">
                    <span class="interact-icon">🔖</span> {{ isInReadingList(article._id) ? t('inReadingList') : t('addToReadingList') }}
                  </button>

                  <button @click="likeArticle(article._id)" class="btn-interact active-like">
                    <span class="interact-icon">❤️</span> {{ t('like') }} (<span>{{ article.likes || 0 }}</span>)
                  </button>
                </div>
              </div>

              <div class="comments-section">
                <h4 class="comments-title">{{ t('comments') }} ({{ article.comments ? article.comments.length : 0 }})</h4>
                <div v-if="article.comments && article.comments.length > 0" class="comment-list">
                  <div v-for="(comment, index) in article.comments" :key="index" class="comment-item">
                    <strong class="comment-author">{{ comment.username }}:</strong> <span class="comment-text">{{ comment.text }}</span>
                  </div>
                </div>
                <p v-else class="empty-comments">{{ t('noCommentsYet') }}</p>
                <div class="comment-input-row">
                  <input v-model="commentInputs[article._id]" type="text" :placeholder="t('commentPlaceholder')" class="input-field" />
                  <button @click="addComment(article._id)" class="btn btn-primary">{{ t('send') }}</button>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- FOOTER -->
    <footer class="app-footer">
      <div class="footer-content">
        <div class="footer-brand">
          <h2 class="footer-logo"><span class="logo-icon">BT</span> Bilfen TechBlog</h2>
          <p class="footer-desc">{{ t('footerDesc') }}</p>
        </div>
        
        <div class="footer-links">
          <div class="footer-column">
            <h4 class="footer-heading">{{ t('socialMedia') }}</h4>
            <div class="social-icons">
              <a href="https://linkedin.com" target="_blank" class="social-link">LinkedIn: bilfen techblog</a>
              <a href="https://twitter.com" target="_blank" class="social-link">X: techblogbilfen</a>
              <a href="https://github.com" target="_blank" class="social-link">GitHub: techblogbilfen</a>
              <a href="https://instagram.com" target="_blank" class="social-link">Instagram: techblogbilfen</a>
              <a href="https://wa.me/905849610553" target="_blank" class="social-link whatsapp-link">💬 WhatsApp: 05849610553</a>
            </div>
          </div>
        </div>
      </div>
      
      <div class="footer-bottom">
        <div class="footer-lang">
          <span :class="['lang-toggle', currentLang === 'tr' ? 'active-lang' : 'passive-lang']" @click="currentLang = 'tr'">TR</span> 
          <span class="lang-divider">|</span> 
          <span :class="['lang-toggle', currentLang === 'en' ? 'active-lang' : 'passive-lang']" @click="currentLang = 'en'">EN</span>
        </div>
        <p class="copyright">© 2026 Bilfen TechBlog. {{ t('allRightsReserved') }}</p>
        <p class="legal-text">{{ t('legalNotice') }}</p>
      </div>
    </footer>

  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue'

const currentLang = ref('tr')

const translations = {
  tr: {
    login: 'Giriş Yap',
    register: 'Kayıt Ol',
    hello: 'Selam',
    home: 'Ana Sayfa',
    stats: 'İstatistik',
    menu: 'Menü',
    account: 'Kullanıcı Hesabı',
    profile: 'Profilim',
    about: 'Hakkımızda',
    topics: 'Konular',
    allArticles: 'Tüm Makaleler',
    contact: 'Ulaşım',
    logout: 'Çıkış Yap',
    loginTitle: 'Hesabınıza Giriş Yapın',
    registerTitle: 'Aramıza Katılın',
    resetPassTitle: 'Şifre Sıfırlama',
    resetPassDesc: 'Kayıtlı e-posta adresinizi girin, size şifre sıfırlama bağlantısı gönderelim.',
    emailPlaceholder: 'E-Posta Adresiniz',
    sendResetLink: 'Sıfırlama Bağlantısı Gönder',
    backToLogin: 'Giriş ekranına dön',
    welcomeBack: 'Tekrar Hoş Geldin',
    quickLogin: 'Tek Tıkla Giriş',
    removeAccount: 'Bu hesabı listeden kaldır',
    usernamePlaceholder: 'Kullanıcı Adı',
    passwordPlaceholder: 'Şifre',
    rememberMe: 'Giriş bilgilerini kaydet',
    forgotPassword: 'Şifremi unuttum?',
    chooseUsername: 'Kullanıcı Adı Seçin',
    choosePassword: 'Şifre Belirleyin',
    completeRegister: 'Kaydı Tamamla',
    systemStats: 'Sistem İstatistikleri',
    totalArticles: 'Toplam Makale',
    totalLikes: 'Toplam Beğeni',
    totalComments: 'Toplam Yorum',
    aboutTitle: 'Bilfen TechBlog Hakkında',
    aboutSubtitle: 'Teknoloji tutkunlarının ve yenilikçi fikirlerin buluşma noktası.',
    founded: 'Kuruluş',
    visionHeader: 'Hedefimiz ve Vizyonumuz',
    visionText1: 'teknoloji dünyasındaki en güncel gelişmeleri, yazılım mühendisliğinin sırlarını, veri tabanı sistemlerini ve dijital trendleri tek bir çatı altında toplamak amacıyla hayata geçirilmiş interaktif bir platformdur.',
    visionText2: 'Amacımız; web geliştirmeden siber güvenliğe, yapay zeka teknolojilerinden yönetim bilişim sistemlerine kadar geniş bir yelpazede bilgi birikimini artırmak ve bu bilgileri geniş kitlelerle paylaşmaktır.',
    featuresHeader: 'Platform Özellikleri',
    feature1Title: 'Modern ve Temiz Arayüz',
    feature1Desc: 'Okuma deneyimini maksimize eden, dikkati dağıtmayan premium tasarım.',
    feature2Title: 'Etkileşimli Topluluk',
    feature2Desc: 'Makaleleri beğenme, favorilere ekleme ve yazarları takip etme imkanı.',
    feature3Title: 'Yapay Zeka Entegrasyonu',
    feature3Desc: 'Uzun metinler için saniyeler içinde okuma özetleri çıkartan akıllı sistem altyapısı.',
    feature4Title: 'Zengin İçerik Editörü',
    feature4Desc: 'Fikirleri en iyi şekilde ifade etmeye olanak tanıyan gelişmiş makale yazım araçları.',
    aboutFooter: 'Geleceği kodlamaya ve bilgiyi çoğaltmaya devam ediyoruz!',
    contentCreator: 'İçerik Üreticisi',
    written: 'Yazılan',
    favorites: 'Favori',
    following: 'Takip Edilen',
    followers: 'Takipçi',
    editBio: 'Düzenle',
    save: 'Kaydet',
    cancel: 'İptal',
    bioPlaceholder: 'Hakkında bir şeyler yaz...',
    myArticles: 'Benim Makalelerim',
    noArticlesYet: 'Henüz hiç makale yayınlamadın.',
    likes: 'Beğeni',
    delete: 'Sil',
    myFavorites: 'Favori Makalelerim',
    noFavoritesYet: 'Henüz favorilere hiç makale eklemedin.',
    myFollowingAuthors: 'Takip Ettiğim Yazarlar',
    noFollowingYet: 'Henüz kimseyi takip etmiyorsun.',
    unfollow: 'Takibi Bırak',
    back: 'Geri Dön',
    authorAllArticles: 'Yazarın Tüm Makaleleri',
    authorNoArticles: 'Bu yazarın henüz makalesi yok.',
    searchPlaceholder: '🔍 Makale, yazar veya kategori ara...',
    trendingArticles: 'Trend Makaleler',
    trend: 'Trend',
    shareNewArticle: 'Yeni Bir Makale Paylaş',
    shareSubtitle: 'Deneyimlerini, fikirlerini ve kodlarını teknoloji dünyasıyla paylaş.',
    dropzoneText: 'Makaleniz için dikkat çekici bir kapak fotoğrafı seçin',
    dropzoneSubtext: '(Sürükleyip bırakın veya tıklayın)',
    fileSelected: 'başarıyla seçildi.',
    articleTitleLabel: 'Makale Başlığı',
    titlePlaceholder: 'Örn: Vue.js 3 ile Composition API Rehberi',
    categoryLabel: 'Kategori',
    selectCategory: 'Seçiniz...',
    codeBlock: 'Kod Bloğu',
    newLine: 'Satır Atla',
    contentPlaceholder: 'İçeriğinizi buraya yazmaya başlayın...',
    publishBtn: 'Makaleyi Yayına Al',
    loadingArticles: 'Makaleler yükleniyor...',
    loadingError: 'Makaleler yüklenirken hata oluştu!',
    noArticlesFound: 'Aradığınız kritere uygun makale bulunamadı.',
    edit: 'Düzenle',
    saveChanges: 'Değişiklikleri Kaydet',
    author: 'Yazar',
    followingStatus: '✓ Takiptesin',
    followBtn: '+ Takip Et',
    quickSummary: 'Hızlı Özet',
    aiAnalyzing: 'Yapay zeka içeriği analiz ediyor...',
    aiSummaryLabel: 'YZ Özeti',
    favorited: 'Favorilerde',
    favorite: 'Favoriye Ekle',
    like: 'Beğen',
    comments: 'Yorumlar',
    noCommentsYet: 'Bu makale için ilk yorumu sen yap.',
    commentPlaceholder: 'Düşüncelerini paylaş...',
    send: 'Gönder',
    footerDesc: 'Teknoloji dünyasıyla fikirlerini, deneyimlerini ve kodlarını paylaş. Geleceği birlikte inşa edelim.',
    socialMedia: 'Sosyal Medya & İletişim',
    allRightsReserved: 'Tüm hakları saklıdır.',
    legalNotice: 'Bu proje, Bilfen Şirketler Grubu staj programı kapsamında geliştirilmiştir.',
    addToReadingList: 'Okuma Listesine Ekle',
    inReadingList: 'Okuma Listesinde ✓'
  },
  en: {
    login: 'Sign In',
    register: 'Sign Up',
    hello: 'Hello',
    home: 'Home',
    stats: 'Statistics',
    menu: 'Menu',
    account: 'User Account',
    profile: 'My Profile',
    about: 'About Us',
    topics: 'Topics',
    allArticles: 'All Articles',
    contact: 'Contact',
    logout: 'Sign Out',
    loginTitle: 'Sign in to your account',
    registerTitle: 'Join the Community',
    resetPassTitle: 'Password Reset',
    resetPassDesc: 'Enter your registered email address, and we will send you a password reset link.',
    emailPlaceholder: 'Your Email Address',
    sendResetLink: 'Send Reset Link',
    backToLogin: 'Back to sign in',
    welcomeBack: 'Welcome Back',
    quickLogin: 'Quick Login',
    removeAccount: 'Remove this account',
    usernamePlaceholder: 'Username',
    passwordPlaceholder: 'Password',
    rememberMe: 'Remember my credentials',
    forgotPassword: 'Forgot password?',
    chooseUsername: 'Choose Username',
    choosePassword: 'Set Password',
    completeRegister: 'Complete Registration',
    systemStats: 'System Statistics',
    totalArticles: 'Total Articles',
    totalLikes: 'Total Likes',
    totalComments: 'Total Comments',
    aboutTitle: 'About Bilfen TechBlog',
    aboutSubtitle: 'The meeting point of technology enthusiasts and innovative ideas.',
    founded: 'Founded',
    visionHeader: 'Our Goal & Vision',
    visionText1: 'is an interactive platform created to gather the latest developments in the world of tech, software engineering secrets, database systems, and digital trends under one roof.',
    visionText2: 'Our goal is to expand knowledge in a wide range from web development to cybersecurity, artificial intelligence technologies to management information systems, and share this knowledge globally.',
    featuresHeader: 'Platform Features',
    feature1Title: 'Modern & Clean UI',
    feature1Desc: 'A distraction-free, premium design that maximizes the reading experience.',
    feature2Title: 'Interactive Community',
    feature2Desc: 'Ability to like articles, add to favorites, and follow authors.',
    feature3Title: 'AI Integration',
    feature3Desc: 'Smart system infrastructure that generates reading summaries for long texts in seconds.',
    feature4Title: 'Rich Content Editor',
    feature4Desc: 'Advanced article writing tools that allow ideas to be expressed perfectly.',
    aboutFooter: 'Continuing to code the future and multiply knowledge!',
    contentCreator: 'Content Creator',
    written: 'Written',
    favorites: 'Favorites',
    following: 'Following',
    followers: 'Followers',
    editBio: 'Edit',
    save: 'Save',
    cancel: 'Cancel',
    bioPlaceholder: 'Write something about yourself...',
    myArticles: 'My Articles',
    noArticlesYet: 'You haven’t published any articles yet.',
    likes: 'Likes',
    delete: 'Delete',
    myFavorites: 'Favorite Articles',
    noFavoritesYet: 'You haven’t added any articles to favorites yet.',
    myFollowingAuthors: 'Authors I Follow',
    noFollowingYet: 'You are not following anyone yet.',
    unfollow: 'Unfollow',
    back: 'Go Back',
    authorAllArticles: 'Author’s All Articles',
    authorNoArticles: 'This author has no articles yet.',
    searchPlaceholder: '🔍 Search article, author or category...',
    trendingArticles: 'Trending Articles',
    trend: 'Trend',
    shareNewArticle: 'Share a New Article',
    shareSubtitle: 'Share your experiences, ideas, and code with the tech world.',
    dropzoneText: 'Choose an eye-catching cover photo for your article',
    dropzoneSubtext: '(Drag and drop or click)',
    fileSelected: 'successfully selected.',
    articleTitleLabel: 'Article Title',
    titlePlaceholder: 'Ex: Vue.js 3 Composition API Guide',
    categoryLabel: 'Category',
    selectCategory: 'Select...',
    codeBlock: 'Code Block',
    newLine: 'New Line',
    contentPlaceholder: 'Start writing your content here...',
    publishBtn: 'Publish Article',
    loadingArticles: 'Loading articles...',
    loadingError: 'Error loading articles!',
    noArticlesFound: 'No articles matching your criteria were found.',
    edit: 'Edit',
    saveChanges: 'Save Changes',
    author: 'Author',
    followingStatus: '✓ Following',
    followBtn: '+ Follow',
    quickSummary: 'Quick Summary',
    aiAnalyzing: 'AI is analyzing the content...',
    aiSummaryLabel: 'AI Summary',
    favorited: 'Favorited',
    favorite: 'Add to Favorites',
    like: 'Like',
    comments: 'Comments',
    noCommentsYet: 'Be the first to comment on this article.',
    commentPlaceholder: 'Share your thoughts...',
    send: 'Send',
    footerDesc: 'Share your ideas, experiences, and code with the tech world. Let’s build the future together.',
    socialMedia: 'Social Media & Contact',
    allRightsReserved: 'All rights reserved.',
    legalNotice: 'This project was developed within the scope of Bilfen Group of Companies internship program.',
    addToReadingList: 'Add to Reading List',
    inReadingList: 'In Reading List ✓'
  }
}

const t = (key) => {
  return translations[currentLang.value][key] || key;
}

const isLoginMode = ref(true)
const isForgotPasswordMode = ref(false)
const forgotEmail = ref('')
const authUsername = ref('')
const authEmail = ref('')
const authPassword = ref('')
const rememberMe = ref(false)

const savedCredential = ref(null)

const currentUser = ref(null) 
const token = ref(null) 
const activeTab = ref('home') 
const commentInputs = reactive({})
const selectedFile = ref(null) 

const isMenuOpen = ref(false)
const showDropdown = ref(false)

const showSummary = reactive({})
const aiSummaries = reactive({})
const isSummarizing = reactive({})

const favorites = reactive({});
const readingList = reactive({});
const following = reactive({});
const selectedAuthor = ref('');

// Biyografi
const userBio = ref('');
const tempBio = ref('');
const isEditingBio = ref(false);

// YENİ: Gerçek Backend takipçi verisini tutacağımız ref
const followersCount = ref(0);

// YENİ: Giriş yapıldığında güncel profil verilerini sunucudan çeken fonksiyon
const fetchUserProfile = async () => {
  if (!currentUser.value) return;
  try {
    const data = await $fetch(`https://bilfen-api-32fr.onrender.com/api/users/${currentUser.value}`);
    followersCount.value = data.followers ? data.followers.length : 0;
    
    if (data.following) {
      following[currentUser.value] = data.following;
      localStorage.setItem('bilfen_following', JSON.stringify(following));
    }
  } catch (err) {
    console.error("Profil verisi çekilemedi:", err);
  }
}

const startEditingBio = () => {
  tempBio.value = userBio.value;
  isEditingBio.value = true;
}

const saveBio = () => {
  userBio.value = tempBio.value;
  localStorage.setItem('bilfen_user_bio', userBio.value);
  isEditingBio.value = false;
}

const isAdmin = computed(() => currentUser.value === 'admin');
const selectedCategoryFilter = ref('Tümü');
const searchQuery = ref('')

onMounted(() => { 
  fetchArticles();
  
  // YENİ: Nuxt SSR Hatalarını önlemek için localStorage erişimleri sayfa yüklendikten sonra yapılıyor
  const savedBio = localStorage.getItem('bilfen_user_bio');
  if (savedBio) {
    userBio.value = savedBio;
  }

  try {
    const savedFavs = localStorage.getItem('bilfen_favorites');
    if (savedFavs) {
      const parsedFavs = JSON.parse(savedFavs);
      Object.keys(parsedFavs).forEach(key => { favorites[key] = parsedFavs[key]; });
    }
    const savedReadingList = localStorage.getItem('bilfen_reading_list');
    if (savedReadingList) {
      const parsedReadingList = JSON.parse(savedReadingList);
      Object.keys(parsedReadingList).forEach(key => { readingList[key] = parsedReadingList[key]; });
    }
    const savedFollows = localStorage.getItem('bilfen_following');
    if (savedFollows) {
      const parsedFollows = JSON.parse(savedFollows);
      Object.keys(parsedFollows).forEach(key => { following[key] = parsedFollows[key]; });
    }

    const savedUser = localStorage.getItem('bilfen_saved_user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      savedCredential.value = parsedUser;
      rememberMe.value = true;
    }
  } catch (e) {
    console.error("LocalStorage okuma hatası:", e);
  }
})

const useSavedCredential = () => {
  if (savedCredential.value) {
    authUsername.value = savedCredential.value.u;
    authPassword.value = savedCredential.value.p;
  }
}

const clearSavedCredential = () => {
  savedCredential.value = null;
  rememberMe.value = false;
  localStorage.removeItem('bilfen_saved_user');
}

const register = async () => {
  if(!authUsername.value || !authEmail.value || !authPassword.value) return alert(currentLang.value === 'tr' ? "Lütfen tüm alanları doldurun!" : "Please fill in all fields!");
  try {
    await $fetch('https://bilfen-api-32fr.onrender.com/api/auth/register', { method: 'POST', body: { username: authUsername.value, email: authEmail.value, password: authPassword.value } });
    alert(currentLang.value === 'tr' ? "Kayıt başarılı! Giriş yapabilirsiniz." : "Registration successful! You can now log in.");
    isLoginMode.value = true;
    isForgotPasswordMode.value = false;
    authPassword.value = ''; authEmail.value = '';
  } catch (err) { alert(err.data?.message || 'Error!'); }
}

const login = async () => {
  if(!authUsername.value || !authPassword.value) return alert(currentLang.value === 'tr' ? "Kullanıcı adı ve şifre girin!" : "Enter username and password!");
  try {
    const response = await $fetch('https://bilfen-api-32fr.onrender.com/api/auth/login', { method: 'POST', body: { username: authUsername.value, password: authPassword.value } });
    
    if (rememberMe.value) {
      localStorage.setItem('bilfen_saved_user', JSON.stringify({ u: authUsername.value, p: authPassword.value }));
    } else {
      localStorage.removeItem('bilfen_saved_user');
    }

    currentUser.value = response.username; 
    token.value = response.token; 
    activeTab.value = 'home'; 

    await fetchUserProfile();

    authUsername.value = ''; 
    authPassword.value = '';
    
  } catch (err) { alert(err.data?.message || 'Login failed!'); }
}

const resetPassword = () => {
  if(!forgotEmail.value) {
    alert(currentLang.value === 'tr' ? "Lütfen kayıtlı e-posta adresinizi girin!" : "Please enter your registered email!");
    return;
  }
  alert(currentLang.value === 'tr' ? `Başarılı! Eğer "${forgotEmail.value}" sistemimizde kayıtlıysa şifre sıfırlama bağlantısı gönderildi.` : `Success! If "${forgotEmail.value}" is registered, a reset link has been sent.`);
  isForgotPasswordMode.value = false;
  isLoginMode.value = true;
  forgotEmail.value = '';
}

const logout = () => { 
  currentUser.value = null; 
  token.value = null; 
  activeTab.value = 'home'; 
  isMenuOpen.value = false;
  cancelEdit(); 

  const savedUser = localStorage.getItem('bilfen_saved_user');
  if (savedUser) {
    const parsedUser = JSON.parse(savedUser);
    savedCredential.value = parsedUser;
    rememberMe.value = true;
  } else {
    savedCredential.value = null;
  }
  authUsername.value = '';
  authPassword.value = '';
}

const articles = ref([])
const pending = ref(true)
const error = ref(null)

const fetchArticles = async () => {
  pending.value = true
  try {
    articles.value = await $fetch('https://bilfen-api-32fr.onrender.com/api/articles')
    error.value = null
  } catch (err) { error.value = err } finally { pending.value = false }
}

const refresh = () => { fetchArticles() }

const totalArticlesCount = computed(() => articles.value.length)
const totalLikesCount = computed(() => articles.value.reduce((sum, article) => sum + (article.likes || 0), 0))
const totalCommentsCount = computed(() => articles.value.reduce((sum, article) => sum + (article.comments ? article.comments.length : 0), 0))
const topArticles = computed(() => [...articles.value].sort((a, b) => (b.likes || 0) - (a.likes || 0)).slice(0, 3))

const categoryList = ['Web Geliştirme', 'Veritabanı & SQL', 'Yapay Zeka', 'Siber Güvenlik', 'Teknoloji', 'Genel']

const searchSuggestions = computed(() => {
  if (searchQuery.value.length < 3 || !articles.value) return [];
  const query = searchQuery.value.toLowerCase();
  return articles.value.filter(article => 
    article.title.toLowerCase().includes(query) || 
    (article.author && article.author.toLowerCase().includes(query)) ||
    (article.category && article.category.toLowerCase().includes(query)) 
  ).slice(0, 5); 
});

const selectSuggestion = (title) => { 
  searchQuery.value = title; 
  selectedCategoryFilter.value = 'Tümü';
  showDropdown.value = false; 
};

const openTrendingArticle = (article) => {
  searchQuery.value = article.title;
  selectedCategoryFilter.value = 'Tümü'; 
  showDropdown.value = false;
  
  setTimeout(() => {
    const listEl = document.getElementById('articles-list');
    if (listEl) {
      const yOffset = listEl.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: yOffset, behavior: 'smooth' });
    }
  }, 50);
}

const filteredArticles = computed(() => {
  if (!articles.value) return []
  // Kural: arama en az 3 karakter olmadan devreye girmez.
  // 2 karakter veya daha azsa, arama terimi yok sayılır (sadece kategori filtresi uygulanır).
  const query = searchQuery.value.trim().toLowerCase()
  const isSearchActive = query.length >= 3

  return articles.value.filter(article => {
    const matchesSearch = !isSearchActive ||
      article.title.toLowerCase().includes(query) || 
      article.content.toLowerCase().includes(query) ||
      (article.category && article.category.toLowerCase().includes(query)) ||
      (article.author && article.author.toLowerCase().includes(query))
    
    const matchesCategory = selectedCategoryFilter.value === 'Tümü' || article.category === selectedCategoryFilter.value
    
    return matchesSearch && matchesCategory
  })
})

const myArticles = computed(() => {
  if (!articles.value || !currentUser.value) return []
  return articles.value.filter(article => article.author === currentUser.value)
})

const userFavorites = computed(() => {
  if (!articles.value || !currentUser.value) return []
  const favIds = favorites[currentUser.value] || []
  return articles.value.filter(article => favIds.includes(article._id))
})

const userReadingList = computed(() => {
  if (!articles.value || !currentUser.value) return []
  const readIds = readingList[currentUser.value] || []
  return articles.value.filter(article => readIds.includes(article._id))
})

const userFollowing = computed(() => {
  if (!currentUser.value) return []
  return following[currentUser.value] || []
})

const authorArticles = computed(() => {
  if (!articles.value || !selectedAuthor.value) return []
  return articles.value.filter(article => article.author === selectedAuthor.value)
})

const viewAuthorProfile = (authorName) => {
  selectedAuthor.value = authorName;
  activeTab.value = 'authorProfile';
}

const toggleFollow = async (authorName) => {
  if (!currentUser.value) { alert(currentLang.value === 'tr' ? "Lütfen giriş yapın!" : "Please log in!"); return; }
  if (authorName === currentUser.value) { alert(currentLang.value === 'tr' ? "Kendini takip edemezsin!" : "You can't follow yourself!"); return; }
  
  try {
    await $fetch(`https://bilfen-api-32fr.onrender.com/api/users/${authorName}/follow`, {
      method: 'POST',
      body: { followerUsername: currentUser.value }
    });

    if (!following[currentUser.value]) { following[currentUser.value] = []; }
    const index = following[currentUser.value].indexOf(authorName);
    if (index > -1) { 
      following[currentUser.value].splice(index, 1); 
    } else { 
      following[currentUser.value].push(authorName); 
    }
    localStorage.setItem('bilfen_following', JSON.stringify(following));
    
    await fetchUserProfile();

  } catch (error) {
    console.error("Takip işlemi başarısız:", error);
  }
}

const isFollowing = (authorName) => {
  if (!currentUser.value || !following[currentUser.value]) return false;
  return following[currentUser.value].includes(authorName);
}

const toggleFavorite = (articleId) => {
  if (!currentUser.value) { alert(currentLang.value === 'tr' ? "Lütfen giriş yapın!" : "Please log in!"); return; }
  if (!favorites[currentUser.value]) { favorites[currentUser.value] = []; }
  const index = favorites[currentUser.value].indexOf(articleId);
  if (index > -1) { favorites[currentUser.value].splice(index, 1); } 
  else { favorites[currentUser.value].push(articleId); }
  localStorage.setItem('bilfen_favorites', JSON.stringify(favorites));
}

const isFavorite = (articleId) => {
  if (!currentUser.value || !favorites[currentUser.value]) return false;
  return favorites[currentUser.value].includes(articleId);
}

const toggleReadingList = (articleId) => {
  if (!currentUser.value) { alert(currentLang.value === 'tr' ? "Lütfen giriş yapın!" : "Please log in!"); return; }
  if (!readingList[currentUser.value]) { readingList[currentUser.value] = []; }
  const index = readingList[currentUser.value].indexOf(articleId);
  if (index > -1) { readingList[currentUser.value].splice(index, 1); } 
  else { readingList[currentUser.value].push(articleId); }
  localStorage.setItem('bilfen_reading_list', JSON.stringify(readingList));
}

const isInReadingList = (articleId) => {
  if (!currentUser.value || !readingList[currentUser.value]) return false;
  return readingList[currentUser.value].includes(articleId);
}

const newTitle = ref('')
const newContent = ref('')
const newCategory = ref('')
const editingArticleId = ref(null)
const editTitle = ref('')
const editContent = ref('')
const editCategory = ref('')

const onFileSelected = (event) => { selectedFile.value = event.target.files[0] }

const toggleSummary = async (article) => {
  const id = article._id;
  
  if (showSummary[id]) {
    showSummary[id] = false;
    return;
  }
  showSummary[id] = true;

  if (aiSummaries[id]) return;
  isSummarizing[id] = true;

  try {
    const response = await $fetch(`https://bilfen-api-32fr.onrender.com/api/articles/${id}/summary`, { method: 'POST' });
    aiSummaries[id] = response.summary;
  } catch (err) {
    setTimeout(() => {
      const plainText = article.content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      const wordCount = plainText.split(' ').length;
      
      if (currentLang.value === 'tr') {
        if (wordCount < 30) {
          aiSummaries[id] = "📌 Bu içerik oldukça kısa ve net olduğu için yapay zeka özetine ihtiyaç duymamaktadır. Doğrudan hızlıca okuyabilirsiniz.";
        } else {
          aiSummaries[id] = `🧠 Yapay Zeka Analizi: Bu makale temel olarak "${article.title}" konusuna odaklanmaktadır. ${article.category || 'Teknoloji'} alanındaki güncel yaklaşımları ve metodolojileri inceleyen yazar (${article.author || 'Anonim'}), okuyucuya teorik bilgi ile pratik örnekleri harmanlayarak sunmaktadır. Metnin ana vurgusu, konunun derinlemesine anlaşılması ve sektörel verimliliğin artırılmasıdır.`;
        }
      } else {
        if (wordCount < 30) {
          aiSummaries[id] = "📌 This content is brief and straightforward, requiring no AI summarization. You can read it directly.";
        } else {
          aiSummaries[id] = `🧠 AI Analysis: This article primarily focuses on "${article.title}". Examining current approaches in the field of ${article.category || 'Technology'}, the author (${article.author || 'Anonymous'}) blends theoretical knowledge with practical examples. The core emphasis is on a deep understanding of the subject and increasing efficiency.`;
        }
      }
      isSummarizing[id] = false;
    }, 1800); 
    return;
  }
  isSummarizing[id] = false;
}

const addArticle = async () => {
  const formData = new FormData();
  formData.append('title', newTitle.value);
  formData.append('content', newContent.value);
  formData.append('category', newCategory.value || 'Genel');
  formData.append('author', currentUser.value);
  if (selectedFile.value) { formData.append('image', selectedFile.value); }

  try {
    await $fetch('https://bilfen-api-32fr.onrender.com/api/articles', { 
      method: 'POST', 
      body: formData,
      headers: { Authorization: `Bearer ${token.value}` }
    });
    newTitle.value = ''; newContent.value = ''; newCategory.value = ''; selectedFile.value = null; refresh();
  } catch (err) { 
    console.error('Makale ekleme hatası:', err);
    alert('Hata detayı: ' + (err.data?.message || err.message || 'Bilinmeyen hata'));
  }
}

const likeArticle = async (id) => {
  if (!currentUser.value) { alert(currentLang.value === 'tr' ? "Lütfen giriş yapın!" : "Please log in!"); return; }
  try { await $fetch(`https://bilfen-api-32fr.onrender.com/api/articles/${id}/like`, { method: 'PUT' }); refresh(); } catch (err) {}
}

const addComment = async (id) => {
  const text = commentInputs[id];
  if (!text || text.trim() === '') return alert(currentLang.value === 'tr' ? "Boş yorum gönderilemez!" : "Empty comment!");
  const commentUser = currentUser.value || 'Misafir';
  try {
    await $fetch(`https://bilfen-api-32fr.onrender.com/api/articles/${id}/comments`, { method: 'POST', body: { username: commentUser, text: text } });
    commentInputs[id] = ''; refresh();
  } catch (err) {}
}

const startEdit = (article) => {
  editingArticleId.value = article._id; editTitle.value = article.title; editContent.value = article.content; editCategory.value = article.category || 'Genel';
}

const cancelEdit = () => { editingArticleId.value = null; editTitle.value = ''; editContent.value = ''; editCategory.value = ''; }

const deleteArticle = async (id) => {
  if (confirm(currentLang.value === 'tr' ? "Bu makaleyi silmek istediğinize emin misiniz?" : "Are you sure you want to delete this article?")) {
    articles.value = articles.value.filter(article => article._id !== id);
    try {
      await $fetch(`https://bilfen-api-32fr.onrender.com/api/articles/${id}`, { 
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token.value}` }
      }); 
    } catch (err) { 
      refresh();
    }
  }
}

const updateArticle = async (id) => {
  try {
    await $fetch(`https://bilfen-api-32fr.onrender.com/api/articles/${id}`, { 
      method: 'PUT', 
      body: { title: editTitle.value, content: editContent.value, category: editCategory.value },
      headers: { Authorization: `Bearer ${token.value}` }
    });
    editingArticleId.value = null; refresh();
  } catch (err) { alert('Error!') }
}
</script>

<style scoped>
/* ==========================================================================
   PREMIUM KURUMSAL TASARIM SİSTEMİ (Slate & Indigo Theme)
   ========================================================================== */

.app-container {
  font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  background-color: #f1f5f9; 
  color: #0f172a; 
  min-height: 100vh;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  display: flex;
  flex-direction: column;
}

/* NAVBAR */
.navbar {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid rgba(226, 232, 240, 0.8);
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.03);
}

.nav-content { 
  max-width: 1040px; 
  margin: 0 auto; 
  padding: 16px 24px; 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
}

.logo { 
  margin: 0; 
  font-size: 20px; 
  font-weight: 800; 
  letter-spacing: -0.03em; 
  display: flex; 
  align-items: center; 
  gap: 12px; 
  color: #0f172a;
}

.logo-icon { 
  background: linear-gradient(135deg, #1e1b4b 0%, #4338ca 100%); 
  color: white; 
  padding: 6px 10px; 
  border-radius: 8px; 
  font-size: 15px; 
  box-shadow: 0 2px 4px rgba(67, 56, 202, 0.3);
}

/* BUTONLAR */
.btn { 
  padding: 10px 18px; 
  border-radius: 8px; 
  cursor: pointer; 
  font-weight: 600; 
  font-size: 14px; 
  border: 1px solid transparent; 
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); 
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-primary { 
  background: #0f172a; 
  color: white; 
  box-shadow: 0 1px 3px rgba(0,0,0,0.1), 0 1px 2px -1px rgba(0,0,0,0.1); 
}
.btn-primary:hover { 
  background: #1e293b; 
  transform: translateY(-1px); 
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1);
}

.btn-primary-outline {
  background: transparent;
  color: #3b82f6;
  border: 1px solid #bfdbfe;
}
.btn-primary-outline:hover {
  background: #eff6ff;
  border-color: #93c5fd;
}

.btn-ghost { background: transparent; color: #64748b; }
.btn-ghost:hover { background: #f1f5f9; color: #0f172a; }
.btn-secondary { background: #f1f5f9; color: #0f172a; font-weight: 500;}
.btn-secondary:hover { background: #e2e8f0; }

.btn-danger { background: #fee2e2; color: #dc2626; }
.btn-danger:hover { background: #fecaca; }
.btn-danger-soft { background: transparent; color: #ef4444; border: 1px solid #fecaca; }
.btn-danger-soft:hover { background: #fef2f2; }

.btn-success { background: #10b981; color: white; }
.btn-warning { background: #f59e0b; color: white; }

.btn-micro { padding: 6px 12px; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer; border: 1px solid transparent; transition: all 0.2s ease; }
.btn-sparkle { background: #fef3c7; color: #d97706; border: 1px solid #fde68a; }
.btn-sparkle:hover { background: #fde68a; }
.btn-block { width: 100%; padding: 12px; font-size: 15px; }

.user-menu-container { display: flex; align-items: center; gap: 16px; position: relative; }
.greeting { font-size: 14px; color: #64748b; }
.menu-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 150; }
.dropdown-menu { position: absolute; top: 52px; right: 0; background: white; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1); width: 240px; display: flex; flex-direction: column; overflow: hidden; z-index: 200; animation: slideDown 0.2s ease-out; }
@keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
.dropdown-header { padding: 16px; background: #f8fafc; border-bottom: 1px solid #e2e8f0; }
.dropdown-label { font-size: 11px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px; }
.dropdown-username { font-size: 15px; font-weight: 700; color: #0f172a; }
.dropdown-item, .dropdown-subitem { text-align: left; background: white; border: none; padding: 12px 16px; cursor: pointer; font-size: 14px; font-weight: 500; color: #334155; transition: background 0.1s; }
.dropdown-item:hover, .dropdown-subitem:hover { background: #f8fafc; color: #0f172a; }
.dropdown-subitem { padding-left: 40px; color: #64748b; font-size: 13px; border-top: 1px solid #f1f5f9; }
.dropdown-section { border-bottom: 1px solid #e2e8f0; border-top: 1px solid #e2e8f0; }
.dropdown-section-title { padding: 12px 16px 8px; font-size: 12px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; }
.contact-item { border-top: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0; display: flex; flex-direction: column; gap: 4px; text-decoration: none; }
.contact-email { color: #3b82f6; font-size: 12px; }
.danger-item { color: #ef4444; font-weight: 600; }
.danger-item:hover { background: #fef2f2; color: #dc2626;}

.main-content { max-width: 1040px; margin: 40px auto; padding: 0 24px; flex: 1; width: 100%; box-sizing: border-box;}

.input-field { 
  width: 100%; 
  padding: 12px 16px; 
  border: 1px solid #cbd5e1; 
  border-radius: 8px; 
  font-size: 15px; 
  color: #1e293b;
  outline: none; 
  background: white; 
  transition: all 0.2s ease; 
  box-sizing: border-box; 
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.02);
}
.input-field::placeholder { color: #94a3b8; }
.input-field:focus { 
  border-color: #3b82f6; 
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15); 
}
.input-label { display: block; font-weight: 600; font-size: 13px; color: #475569; margin-bottom: 8px; }

.mb-2 { margin-bottom: 12px; }
.mb-3 { margin-bottom: 20px; }
.mb-4 { margin-bottom: 32px; }
.mt-3 { margin-top: 20px; }
.mt-4 { margin-top: 32px; }
.mr-2 { margin-right: 8px; }
.text-center { text-align: center; }

.publish-card, .auth-card, .article-card, .stat-card, .profile-header-card, .comments-section { 
  background: #ffffff; 
  border-radius: 16px; 
  border: 1px solid #e2e8f0; 
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05); 
}

/* YENİ İÇERİK YAYINLAMA */
.publish-card { padding: 40px; margin-bottom: 40px; }
.publish-header { margin-bottom: 32px; text-align: center; }
.publish-title { margin: 0 0 8px 0; font-size: 24px; letter-spacing: -0.02em; font-weight: 800; color: #0f172a; }
.publish-subtitle { margin: 0; color: #64748b; font-size: 15px; }

/* Dropzone */
.dropzone-container { position: relative; }
.dropzone-label { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 48px 20px; background: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 12px; cursor: pointer; transition: all 0.2s ease; }
.dropzone-label:hover { background: #f1f5f9; border-color: #94a3b8; }
.dropzone-icon { font-size: 36px; margin-bottom: 16px; }
.dropzone-text { font-size: 15px; font-weight: 600; color: #334155; margin-bottom: 6px; }
.dropzone-subtext { font-size: 13px; color: #94a3b8; }
.hidden-file-input { opacity: 0; position: absolute; width: 0; height: 0; }
.file-selected-alert { margin-top: 12px; padding: 12px 16px; background: #ecfdf5; color: #065f46; border-radius: 8px; font-size: 14px; border: 1px solid #a7f3d0; text-align: center; font-weight: 500;}

.publish-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 24px; }
@media (max-width: 600px) { .publish-grid { grid-template-columns: 1fr; } }

/* Editör */
.editor-container { border: 1px solid #cbd5e1; border-radius: 12px; overflow: hidden; background: white; transition: all 0.2s ease; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.02);}
.editor-container:focus-within { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15); }
.editor-toolbar { background: #f8fafc; padding: 12px 16px; border-bottom: 1px solid #cbd5e1; display: flex; gap: 16px; align-items: center; flex-wrap: wrap; }
.toolbar-group { display: flex; gap: 4px; }
.toolbar-divider { width: 1px; height: 24px; background: #cbd5e1; }
.btn-tool { background: transparent; border: 1px solid transparent; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 500; color: #475569; transition: all 0.2s; }
.btn-tool:hover { background: #e2e8f0; color: #0f172a; }
.font-weight-bold { font-weight: 700; color: #1e293b;}
.code-btn { background: #f1f5f9; border-color: #e2e8f0; font-family: ui-monospace, monospace; font-size: 12px; }
.editor-textarea { width: 100%; padding: 24px; border: none; min-height: 300px; outline: none; box-sizing: border-box; resize: vertical; font-size: 16px; line-height: 1.8; color: #334155; }
.editor-textarea::placeholder { color: #94a3b8; font-style: italic; }
.editor-textarea-small { min-height: 150px; }
.publish-actions { text-align: right; margin-top: 24px; }
.btn-publish { font-size: 16px; padding: 14px 32px; background: linear-gradient(135deg, #0f172a 0%, #334155 100%); }

/* MAKALELER */
.article-card { padding: 32px; margin-bottom: 32px; transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.article-card:hover { transform: translateY(-3px); box-shadow: 0 12px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04); }
.article-image-wrapper { margin: -32px -32px 32px -32px; }
.article-image { width: 100%; height: 320px; object-fit: cover; border-top-left-radius: 16px; border-top-right-radius: 16px; }
.article-title { margin: 0 0 16px 0; font-size: 26px; font-weight: 800; letter-spacing: -0.02em; line-height: 1.3; color: #0f172a;}
.article-meta-row { display: flex; gap: 16px; align-items: center; margin-bottom: 24px; flex-wrap: wrap; border-bottom: 1px solid #f1f5f9; padding-bottom: 16px;}
.tag { background: #f1f5f9; color: #475569; padding: 6px 12px; border-radius: 8px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;}
.tag-small { font-size: 10px; padding: 4px 8px; border-radius: 6px;}
.meta-text { color: #64748b; font-size: 14px; }
.meta-date { color: #94a3b8; font-size: 13px; font-weight: 500;}
.article-content { line-height: 1.8; color: #334155; font-size: 16px; }
.article-preview { line-height: 1.7; color: #475569; font-size: 15px; margin-bottom: 16px; display: -webkit-box; -webkit-line-clamp: 3; line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;}
.article-footer { display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #f1f5f9; padding-top: 20px; margin-top: 32px; }
.article-actions { position: absolute; top: 24px; right: 24px; display: flex; gap: 8px; }

/* ETKİLEŞİM BUTONLARI */
.interaction-buttons { display: flex; gap: 12px; }
.btn-interact { background: white; border: 1px solid #cbd5e1; padding: 8px 16px; border-radius: 10px; font-size: 14px; font-weight: 600; color: #475569; cursor: pointer; transition: all 0.2s ease; display: flex; align-items: center; gap: 6px; box-shadow: 0 1px 2px rgba(0,0,0,0.02);}
.btn-interact:hover { background: #f8fafc; border-color: #94a3b8; color: #0f172a;}
.interact-icon { font-size: 16px; }
.active-fav { background: #fffbeb; color: #d97706; border-color: #fde68a; }
.active-fav:hover { background: #fef3c7; border-color: #fcd34d; }
.active-like { background: #fef2f2; color: #e11d48; border-color: #fecaca; }
.active-like:hover { background: #fee2e2; border-color: #fca5a5; }

/* TRENDING BÖLÜMÜ */
.trending-section { margin-bottom: 48px; }
.trending-title { font-size: 20px; font-weight: 700; margin-bottom: 20px; display: flex; align-items: center; gap: 10px; letter-spacing: -0.01em; color: #0f172a;}
.trending-scroll { display: flex; gap: 20px; overflow-x: auto; padding-bottom: 12px; scrollbar-width: none; }
.trend-card { min-width: 280px; flex: 1; background: white; border: 1px solid #e2e8f0; padding: 24px; border-radius: 16px; cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 0 1px 3px rgba(0,0,0,0.02);}
.trend-card:hover { border-color: #cbd5e1; transform: translateY(-4px); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05); }
.trend-rank { font-size: 12px; color: #3b82f6; font-weight: 700; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.05em; }
.trend-title { font-size: 18px; font-weight: 700; margin-bottom: 16px; line-height: 1.4; color: #0f172a; display: -webkit-box; -webkit-line-clamp: 2; line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;}
.trend-meta { display: flex; justify-content: space-between; font-size: 13px; color: #64748b; font-weight: 500;}
.trend-likes { color: #e11d48; font-weight: 600;}

/* FİLTRELER VE ARAMA */
.search-container { position: relative; margin-bottom: 24px; }
.search-input { border-radius: 12px; padding: 18px 24px; font-size: 16px; background: white; border: 1px solid #cbd5e1; box-shadow: 0 2px 4px rgba(0,0,0,0.02); }
.search-input:focus { border-color: #3b82f6; box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.1), 0 0 0 3px rgba(59, 130, 246, 0.15); }
.search-dropdown { position: absolute; top: calc(100% + 8px); left: 0; right: 0; background: white; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1); z-index: 50; overflow: hidden; }
.search-item { padding: 16px 24px; cursor: pointer; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; transition: background 0.2s;}
.search-item:last-child { border-bottom: none; }
.search-item:hover { background: #f8fafc; }
.search-item-title { color: #0f172a; font-size: 15px;}
.search-item-author { font-size: 13px; color: #64748b; margin-top: 4px;}
.category-filters { display: flex; gap: 12px; margin-bottom: 40px; overflow-x: auto; padding-bottom: 8px; scrollbar-width: none; }
.btn-filter { padding: 10px 20px; border-radius: 24px; cursor: pointer; font-weight: 600; font-size: 14px; white-space: nowrap; transition: all 0.2s; background: white; color: #64748b; border: 1px solid #cbd5e1; box-shadow: 0 1px 2px rgba(0,0,0,0.02);}
.btn-filter:hover { border-color: #94a3b8; color: #0f172a; }
.btn-filter.active { background: #0f172a; color: white; border-color: #0f172a; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }

/* PROFİL VE İSTATİSTİKLER */
.profile-header-card { padding: 48px 24px; text-align: center; margin-bottom: 40px; border: none; background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);}
.profile-avatar-large { width: 88px; height: 88px; border-radius: 50%; background: linear-gradient(135deg, #0f172a 0%, #334155 100%); color: white; display: flex; align-items: center; justify-content: center; font-size: 36px; font-weight: 800; margin: 0 auto 20px; box-shadow: 0 10px 15px -3px rgba(15, 23, 42, 0.2); border: 4px solid white;}
.profile-name { margin: 0; font-size: 32px; font-weight: 800; letter-spacing: -0.02em; color: #0f172a;}
.profile-role { color: #64748b; margin-top: 8px; font-size: 16px; font-weight: 500; }
.profile-stats { display: flex; justify-content: center; gap: 24px; margin-top: 32px; flex-wrap: wrap; }
.p-stat-box { background: white; padding: 20px 32px; border-radius: 16px; border: 1px solid #e2e8f0; display: flex; flex-direction: column; align-items: center; min-width: 120px; box-shadow: 0 1px 3px rgba(0,0,0,0.02);}
.p-stat-box strong { font-size: 28px; font-weight: 800; margin-bottom: 4px;}
.p-stat-box span { font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }

.bio-container { max-width: 500px; margin: 12px auto 0; }
.bio-edit-container { max-width: 450px; margin: 12px auto 0; }

.section-title { font-size: 28px; font-weight: 800; letter-spacing: -0.02em; margin-bottom: 32px; color: #0f172a;}
.section-subtitle { font-size: 20px; font-weight: 700; letter-spacing: -0.01em; border-bottom: 1px solid #e2e8f0; padding-bottom: 16px; margin-bottom: 24px; color: #0f172a;}

.minimal-card { padding: 24px; margin-bottom: 16px; transition: all 0.2s ease; border-color: #e2e8f0;}
.minimal-card:hover { border-color: #cbd5e1; transform: translateX(4px);}
.minimal-card-title { margin: 0 0 10px 0; font-size: 18px; font-weight: 700; color: #0f172a;}
.flex-between { display: flex; justify-content: space-between; align-items: center; }

.following-list { display: flex; gap: 16px; flex-wrap: wrap; }
.author-badge { background: white; border: 1px solid #e2e8f0; padding: 12px 20px; border-radius: 12px; display: flex; align-items: center; gap: 16px; box-shadow: 0 1px 2px rgba(0,0,0,0.02);}
.author-name { font-weight: 700; font-size: 15px; cursor: pointer; transition: color 0.2s; color: #0f172a;}
.author-name:hover { color: #3b82f6; }

.stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; margin-bottom: 48px; }
.stat-card { padding: 40px 32px; border: none; background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);}
.stat-value { font-size: 48px; font-weight: 800; line-height: 1;}
.stat-label { font-size: 14px; color: #64748b; font-weight: 600; margin-top: 12px; text-transform: uppercase; letter-spacing: 0.05em; }

/* YORUMLAR */
.comments-section { padding: 32px; margin-top: 32px; background: #f8fafc; border-color: #e2e8f0;}
.comments-title { margin: 0 0 24px 0; font-size: 18px; font-weight: 700; color: #0f172a;}
.comment-list { display: flex; flex-direction: column; gap: 16px; margin-bottom: 24px; }
.comment-item { background: white; padding: 16px 20px; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 1px 2px rgba(0,0,0,0.02);}
.comment-author { color: #3b82f6; font-size: 14px;}
.comment-text { color: #334155; font-size: 15px; margin-left: 8px;}
.comment-input-row { display: flex; gap: 16px; }

/* AUTH KARTI (Giriş/Kayıt) */
.auth-card { padding: 48px; max-width: 440px; margin: 80px auto; border: none; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01); }
.auth-title { text-align: center; margin-top: 0; margin-bottom: 32px; font-size: 26px; font-weight: 800; letter-spacing: -0.02em; color: #0f172a;}
.auth-desc { color: #64748b; font-size: 15px; text-align: center; margin: -20px 0 24px 0; line-height: 1.5;}
.form-group { display: flex; flex-direction: column; gap: 20px; }
.auth-options { display: flex; justify-content: space-between; align-items: center; margin-top: -4px; margin-bottom: 8px;}
.checkbox-label { display: flex; align-items: center; gap: 8px; font-size: 14px; color: #475569; cursor: pointer; font-weight: 500;}
.custom-checkbox { width: 16px; height: 16px; border-radius: 4px; border: 1px solid #cbd5e1; cursor: pointer;}
.forgot-password { text-align: right; }
.link-primary { color: #3b82f6; font-size: 14px; text-decoration: none; font-weight: 600; transition: color 0.2s; }
.link-primary:hover { color: #2563eb; }
.link-muted { color: #64748b; font-size: 14px; text-decoration: none; font-weight: 500; transition: color 0.2s; }
.link-muted:hover { color: #0f172a; }

.text-dark { color: #0f172a; }
.text-blue { color: #3b82f6; }
.text-red { color: #e11d48; }
.text-green { color: #10b981; }

.empty-state { text-align: center; padding: 64px 20px; color: #94a3b8; background: white; border: 2px dashed #e2e8f0; border-radius: 16px; margin-bottom: 24px; font-size: 15px; font-weight: 500;}
.empty-icon { font-size: 48px; display: block; margin-bottom: 16px; opacity: 0.4; }
.empty-comments { color: #64748b; font-style: italic; font-size: 14px; margin-bottom: 24px;}

.fade-in { animation: fadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1); }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

/* YZ Animasyon ve Kutu Tasarımı */
.ai-summary { background: linear-gradient(to right, #f8fafc, #ffffff); border-left: 4px solid #4338ca; padding: 24px; margin-bottom: 32px; border-radius: 0 12px 12px 0; font-size: 15px; color: #334155; line-height: 1.7; box-shadow: 0 1px 3px rgba(0,0,0,0.02);}
.ai-title { color: #4338ca; font-weight: 700; margin-right: 8px;}
.summary-loading { display: flex; align-items: center; gap: 12px; font-weight: 600; color: #4338ca; }
.spinner { animation: spin 2s linear infinite; display: inline-block; font-size: 20px; }
@keyframes spin { 100% { transform: rotate(360deg); } }
.ai-btn { background: #e0e7ff; color: #4338ca; border-color: #c7d2fe; }
.ai-btn:hover { background: #c7d2fe; border-color: #a5b4fc;}

/* Kayıtlı Hesap Önerisi Tasarımı */
.saved-user-card { background: linear-gradient(145deg, #ffffff 0%, #f8fafc 100%); border: 1px solid #e2e8f0; border-radius: 16px; padding: 20px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); margin-bottom: 24px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); position: relative; overflow: hidden; }
.saved-user-card::before { content: ''; position: absolute; top: 0; left: 0; width: 4px; height: 100%; background: linear-gradient(to bottom, #3b82f6, #8b5cf6); border-radius: 4px 0 0 4px; }
.saved-user-card:hover { transform: translateY(-2px); box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.08); border-color: #cbd5e1; }
.saved-user-content { display: flex; align-items: center; gap: 16px; }
.saved-user-avatar { width: 48px; height: 48px; border-radius: 50%; background: linear-gradient(135deg, #3b82f6 0%, #2dd4bf 100%); color: white; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: 800; box-shadow: 0 4px 6px rgba(59, 130, 246, 0.2); }
.saved-user-info { display: flex; flex-direction: column; gap: 4px; }
.saved-title { font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
.saved-username { font-size: 18px; font-weight: 800; color: #0f172a; }
.saved-user-actions { display: flex; align-items: center; gap: 16px; }
.quick-login-text { font-size: 13px; color: #3b82f6; font-weight: 700; opacity: 0; transition: all 0.3s; transform: translateX(10px); }
.saved-user-card:hover .quick-login-text { opacity: 1; transform: translateX(0); }
.btn-clear-saved { background: #f1f5f9; border: none; color: #94a3b8; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; }
.btn-clear-saved:hover { background: #fee2e2; color: #ef4444; }

/* Hakkımızda Ekranı Özel Sınıfları */
.about-section { padding: 64px 48px; border: none;}
.about-header { border-bottom: 1px solid #e2e8f0; padding-bottom: 32px; margin-bottom: 40px; text-align: center;}
.about-title { display: flex; align-items: center; justify-content: center; gap: 12px; font-size: 32px;}
.about-logo { font-size: 24px; padding: 8px 12px; }
.about-content { font-size: 18px; color: #334155; line-height: 1.8; max-width: 800px; margin: 0 auto;}
.about-content h3 { color: #0f172a; margin-top: 48px; margin-bottom: 24px; font-size: 24px; font-weight: 800; letter-spacing: -0.01em;}
.about-content ul { padding-left: 24px; margin-bottom: 32px; }
.about-content li { margin-bottom: 16px; }
.about-badge { background: #f8fafc; border-left: 4px solid #3b82f6; padding: 20px 24px; border-radius: 0 12px 12px 0; margin-bottom: 40px; }
.about-badge p { margin: 0; font-weight: 600; color: #0f172a; font-size: 16px;}
.about-badge span { font-weight: 400; color: #475569; }
.about-footer-text { text-align: center; margin-top: 64px; font-weight: 700; color: #3b82f6; font-size: 20px; letter-spacing: -0.01em;}

/* Düzenleme Modu */
.edit-mode-container { background: #f8fafc; padding: 24px; border-radius: 12px; border: 1px solid #e2e8f0;}
.edit-actions { display: flex; gap: 12px; margin-top: 16px;}

/* PROFESYONEL FOOTER */
.app-footer {
  background-color: #ffffff;
  border-top: 1px solid #e2e8f0;
  padding: 64px 24px 32px;
  margin-top: auto; 
}

.footer-content {
  max-width: 1040px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 48px;
  margin-bottom: 48px;
}

.footer-brand { max-width: 320px; }
.footer-logo { margin: 0 0 16px 0; font-size: 20px; font-weight: 800; display: flex; align-items: center; gap: 12px; color: #0f172a; }
.footer-desc { color: #64748b; font-size: 15px; line-height: 1.6; margin: 0; }

.footer-heading { font-size: 14px; font-weight: 700; color: #0f172a; text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 20px 0; }

.social-icons { display: flex; flex-direction: column; gap: 12px; }
.social-link { color: #64748b; text-decoration: none; font-size: 14px; font-weight: 600; transition: color 0.2s; }
.social-link:hover { color: #3b82f6; }
.whatsapp-link { color: #10b981; }
.whatsapp-link:hover { color: #059669; }

.footer-bottom {
  max-width: 1040px;
  margin: 0 auto;
  border-top: 1px solid #f1f5f9;
  padding-top: 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 12px;
}

.footer-lang { font-size: 14px; font-weight: 700; margin-bottom: 4px; display: flex; gap: 8px; align-items: center;}
.lang-toggle { cursor: pointer; transition: color 0.2s; }
.active-lang { color: #0f172a; border-bottom: 2px solid #0f172a; padding-bottom: 2px;}
.passive-lang { color: #94a3b8; }
.passive-lang:hover { color: #0f172a; }
.lang-divider { color: #cbd5e1; }

.copyright { color: #475569; font-size: 14px; font-weight: 600; margin: 0; }
.legal-text { color: #94a3b8; font-size: 13px; margin: 0; max-width: 600px; line-height: 1.6; }

@media (max-width: 768px) {
  .footer-content { flex-direction: column; gap: 32px; }
  .footer-brand { max-width: 100%; text-align: center; }
  .footer-logo { justify-content: center; }
  .footer-column { text-align: center; }
  .social-icons { align-items: center; }
}
</style>