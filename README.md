# DANCI
NESTJS 单词后台管理系统和H5 应用开发

## 应用形式
-后台管理系统
- H5 应用
- 多端开发
## 亮点
-数据清洗
github 高星的 单词资料库
数据清洗 （选择、格式化、审核）
- supabase 云端psql数据库
  关系型数据库，
- 直接支持向量数据库
- 云端 BASS数据库
  Backend as a Service
- ORM 
  不用写sql，不用做数据库底层处理
  对象关系映射
  todo.save() 保存
  对象和数据库一行记录 对应起来

## 后台管理系统
### 单词书管理
维护单词书，包括单词书的创建，删除、更新、查询等操作。
交给小编管理员
### 管理员管理
-注册个超级管理员，一个人
-添加管理员

/ -> 注册超管页面

## shadcn/ui ui组件库
- 80% 前端组件业务趋同 不用重复造轮子 选用第三方组件库
- element-ui / ANT Design
- shadcn 定制性很好
tailwindcss 配合使用
 语义化 ai 友好
 按需加载
## supabase
BASS 数据库云服务
性能、安全、可扩展性、部署成本
几乎为0
- psql embeeding+关系数据库